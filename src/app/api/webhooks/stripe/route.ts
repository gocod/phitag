import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Ensures Next.js doesn't attempt to cache this route
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // 1. Get the RAW body text for signature verification
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
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined in environment variables.");
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error(`❌ Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // --- HELPER: TRIGGER NOTIFICATION (Updated for Brevo Logic) ---
  const notifyAdminOfUpgrade = async (email: string, plan: string, type: string, amount?: number) => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
      await fetch(`${baseUrl}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 🎯 FIX: Using "checkout.completed" ensures the Notify route triggers the 'isSale' template
          eventType: type === "upgraded" ? "checkout.session.completed" : "subscription.canceled",
          userEmail: email,
          newPlan: plan, 
          price: amount 
        }),
      });
    } catch (e) {
      console.error("❌ Failed to trigger notification API:", e);
    }
  };

  // --- HANDLE STRIPE EVENTS ---
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded": {
      const userEmail = session.customer_details?.email || session.metadata?.userEmail;
      
      let planType = session.metadata?.planType || "Governance Pro";
      if (planType === "Pro") planType = "Governance Pro";

      // Convert cents to dollars for the email
      const priceAmount = session.amount_total ? session.amount_total / 100 : 0;

      if (userEmail) {
        // Update Firestore
        await db.collection("users").doc(userEmail).set({
          stripeCustomerId: session.customer,
          plan: planType,
          isPro: true,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        // Fire the notification with the correct variables
        await notifyAdminOfUpgrade(userEmail, planType, "upgraded", priceAmount);
        console.log(`✅ SUCCESS: ${userEmail} upgraded to ${planType}`);
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
          plan: "Free Trial",
          isPro: false,
          canceledAt: FieldValue.serverTimestamp()
        });

        await notifyAdminOfUpgrade(email, "Reverted to Free Trial", "canceled");
        console.log(`❌ CANCELED: Access revoked for ${email}`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return new NextResponse("Webhook Received", { status: 200 });
}