import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Using the Admin SDK you just fixed
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature found", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Webhook Signature Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // --- HELPER: NOTIFY ADMIN OF REVENUE ---
  const notifyAdminOfUpgrade = async (email: string, plan: string, type: string) => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: type === "upgraded" ? "💰 NEW SUBSCRIPTION" : "📉 SUBSCRIPTION CANCELED",
        userEmail: email,
        planName: plan
      }),
    });
  };

  // --- HANDLE EVENTS ---
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.payment_succeeded": {
      const userEmail = session.customer_details?.email || session.customer_email;
      // Map your internal plan keys from Stripe Metadata
      const planType = session.metadata?.planType || "Governance Pro"; 
      const stripeCustomerId = session.customer;

      if (userEmail) {
        // 1. UPDATE FIREBASE IN REAL-TIME
        await db.collection("users").doc(userEmail).set({
          stripeCustomerId: stripeCustomerId,
          plan: planType,
          isPro: true,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        // 2. TRIGGER RESEND NOTIFICATION
        await notifyAdminOfUpgrade(userEmail, planType, "upgraded");
        console.log(`✅ DATABASE UPDATED: ${userEmail} is now ${planType}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const stripeCustomerId = session.customer;

      // Find user by Stripe ID and downgrade them
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
        console.log(`❌ ACCESS REVOKED: ${email}`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return new NextResponse("Webhook Received", { status: 200 });
}