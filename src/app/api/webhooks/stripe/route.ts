import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Webhook Error: No stripe-signature found");
    return new NextResponse("No signature found", { status: 400 });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET missing");

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // --- HELPER: TRIGGER NOTIFICATION ---
  const notifyAdminOfUpgrade = async (email: string, plan: string, type: string, amount?: number) => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
      await fetch(`${baseUrl}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: type === "upgraded" ? "checkout.session.completed" : "subscription.canceled",
          userEmail: email,
          newPlan: plan, 
          price: amount 
        }),
      });
    } catch (e) {
      console.error("❌ Notification API error:", e);
    }
  };

  // --- HANDLE STRIPE EVENTS ---
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded": {
      // 🎯 Priority 1: Use client_reference_id (we set this as userEmail in checkout route)
      // 🎯 Priority 2: Use customer_details or metadata
      const userEmail = session.client_reference_id || session.customer_details?.email || session.metadata?.userEmail;
      
      // Determine if this is a trial/pilot
      const isTrial = session.subscription_data?.metadata?.isTrial === "true";
      
      // Logic: If it's a pilot, we force 'Governance Pro'. Otherwise, read the metadata.
      let planType = session.metadata?.planType || "Governance Pro";
      if (isTrial) planType = "Governance Pro (90-Day Pilot)";
      if (planType === "Pro") planType = "Governance Pro";

      const priceAmount = session.amount_total ? session.amount_total / 100 : 0;

      if (userEmail) {
        await db.collection("users").doc(userEmail).set({
          stripeCustomerId: session.customer,
          plan: planType.toLowerCase(), // Store lowercase to match your Tier type ('pro', 'elite')
          tier: (planType.toLowerCase().includes("elite")) ? "elite" : "pro", 
          isPro: true,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        await notifyAdminOfUpgrade(userEmail, planType, "upgraded", priceAmount);
        console.log(`✅ SUCCESS: ${userEmail} is now ${planType}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const stripeCustomerId = session.customer;
      const userQuery = await db.collection("users")
        .where("stripeCustomerId", "==", stripeCustomerId)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const email = userDoc.id;

        await userDoc.ref.update({
          plan: "free",
          tier: "free",
          isPro: false,
          canceledAt: FieldValue.serverTimestamp()
        });

        await notifyAdminOfUpgrade(email, "Reverted to Free", "canceled");
        console.log(`❌ ACCESS REVOKED: ${email}`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return new NextResponse("Webhook Received", { status: 200 });
}