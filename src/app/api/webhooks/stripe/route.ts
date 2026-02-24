import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * STRIPE WEBHOOK HANDLER
 * This handles the transition from Checkout to active Subscription.
 * Optimized for the 90-Day Clinical Pilot strategy.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  // --- SECURITY CHECK: SIGNATURE ---
  if (!signature) {
    console.error("❌ Webhook Error: No stripe-signature found in headers");
    return new NextResponse("No signature found", { status: 400 });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ Configuration Error: STRIPE_WEBHOOK_SECRET is missing from environment");
      throw new Error("STRIPE_WEBHOOK_SECRET missing");
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // --- HELPER: TRIGGER ADMIN NOTIFICATION ---
  // This ensures your team is alerted via your internal API when a hospital joins the pilot.
  const notifyAdminOfUpgrade = async (email: string, plan: string, type: string, amount?: number) => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
      const notificationPayload = {
        eventType: type === "upgraded" ? "checkout.session.completed" : "subscription.canceled",
        userEmail: email,
        newPlan: plan, 
        price: amount 
      };

      console.log(`📡 Sending notification to Admin API for: ${email}`);
      
      await fetch(`${baseUrl}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload),
      });
    } catch (e) {
      console.error("❌ Notification API error (Non-fatal):", e);
    }
  };

  // --- HANDLE STRIPE EVENTS ---
  // checkout.session.completed: Fired when the user finishes the Stripe hosted flow.
  // customer.subscription.deleted: Fired when a subscription ends or is canceled.
  switch (event.type) {
    case "checkout.session.completed": {
      console.log("🔔 Processing checkout.session.completed...");

      // 🎯 RESOLVE USER IDENTITY
      // We prioritize client_reference_id because it is the most reliable link to our session.
      const userEmail = session.client_reference_id || session.customer_details?.email || session.metadata?.userEmail;
      
      if (!userEmail) {
        console.error("❌ Webhook Critical Error: No userEmail could be resolved from session object");
        break;
      }

      // 🎯 RESOLVE PLAN & TIER (Normalization Fix)
      // We read the plan name from metadata and convert to lowercase to match NextAuth 'pro'/'elite' logic.
      const rawPlan = session.metadata?.planType || "Governance Pro";
      const normalizedPlan = rawPlan.toLowerCase();
      
      // Determine Tier: If the string contains 'elite', give them 'elite' tier, otherwise 'pro'.
      const finalTier = normalizedPlan.includes("elite") ? "elite" : "pro";

      const priceAmount = session.amount_total ? session.amount_total / 100 : 0;

      console.log(`🔄 Updating Firestore: Setting ${userEmail} to Tier: ${finalTier}`);

      // 🎯 FIRESTORE UPDATE
      // We use .set with merge: true to avoid deleting custom user data like 'name' or 'avatar'
      await db.collection("users").doc(userEmail).set({
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        plan: normalizedPlan, // Saves as 'governance pro' or 'compliance elite'
        tier: finalTier,      // Saves as 'pro' or 'elite'
        isPro: true,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      // 🎯 TRIGGER NOTIFICATION
      await notifyAdminOfUpgrade(userEmail, rawPlan, "upgraded", priceAmount);
      
      console.log(`✅ WEBHOOK SUCCESS: ${userEmail} is now ${finalTier.toUpperCase()}`);
      break;
    }

    case "customer.subscription.deleted": {
      console.log("🔔 Processing customer.subscription.deleted...");
      
      const stripeCustomerId = session.customer;
      
      // Look up user by Stripe ID since we don't have their email in the session metadata here
      const userQuery = await db.collection("users")
        .where("stripeCustomerId", "==", stripeCustomerId)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const email = userDoc.id;

        console.log(`⚠️ Revoking access for: ${email}`);

        await userDoc.ref.update({
          plan: "free",
          tier: "free",
          isPro: false,
          canceledAt: FieldValue.serverTimestamp()
        });

        await notifyAdminOfUpgrade(email, "Reverted to Free", "canceled");
        console.log(`❌ ACCESS REVOKED: ${email} downgraded to free tier`);
      } else {
        console.warn(`⚠️ Subscription deleted for unknown Stripe Customer ID: ${stripeCustomerId}`);
      }
      break;
    }

    default:
      // Other events like invoice.created or customer.updated are ignored for now.
      console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
  }

  // Always return a 200 OK to Stripe within 2 seconds to avoid retry-loops.
  return new NextResponse("Webhook Received", { status: 200 });
}