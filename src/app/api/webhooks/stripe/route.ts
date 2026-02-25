import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * STRIPE WEBHOOK HANDLER
 * * CORE RESPONSIBILITIES:
 * 1. Verify Stripe Signatures for Security.
 * 2. Resolve User Identity via client_reference_id or Metadata.
 * 3. Normalize Plan Names to lowercase 'pro' or 'elite' for the Auth Session.
 * 4. Handle 90-Day Clinical Pilot logic vs. Standard Subscriptions.
 * 5. Update Firestore permissions and trigger Admin Notifications.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  // --- 🛡️ SECURITY LAYER: SIGNATURE VERIFICATION ---
  if (!signature) {
    console.error("❌ Webhook Error: No stripe-signature found in incoming request headers.");
    return new NextResponse("No signature found", { status: 400 });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ Configuration Error: STRIPE_WEBHOOK_SECRET is missing from environment variables.");
      throw new Error("STRIPE_WEBHOOK_SECRET missing");
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Cast the event object for easier property access
  const session = event.data.object as any;

  // --- 📡 HELPER: TRIGGER ADMIN NOTIFICATION ---
  /**
   * Hits the internal /api/admin/notify endpoint to trigger emails/Slack alerts.
   * Ensures the admin sees the professional display name (e.g. "Compliance Elite").
   */
  const notifyAdminOfUpgrade = async (email: string, plan: string, type: string, amount?: number) => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
      const notificationPayload = {
        eventType: type === "upgraded" ? "checkout.session.completed" : "subscription.canceled",
        userEmail: email,
        newPlan: plan, 
        price: amount 
      };

      console.log(`📡 Sending notification to Admin API for: ${email} [Plan: ${plan}]`);
      
      const response = await fetch(`${baseUrl}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload),
      });

      if (!response.ok) {
        console.warn(`⚠️ Notification API returned status: ${response.status}`);
      }
    } catch (e) {
      console.error("❌ Notification API error (Non-fatal):", e);
    }
  };

  // --- 🕹️ MAIN EVENT ROUTER ---
  switch (event.type) {
    /**
     * SUCCESSFUL CHECKOUT
     * Fired when a user successfully completes the Stripe checkout flow.
     */
    case "checkout.session.completed": {
      console.log("🔔 [EVENT] checkout.session.completed detected.");

      // 🎯 RESOLVE USER IDENTITY
      // client_reference_id is our primary key passed during the checkout route initialization.
      const userEmail = session.client_reference_id || session.customer_details?.email || session.metadata?.userEmail;
      
      if (!userEmail) {
        console.error("❌ Webhook Critical Error: No userEmail could be resolved from session object. Data loss imminent.");
        break;
      }

      // 🎯 RESOLVE PLAN & TIER (Case-Sensitivity Fix)
      // planType now contains "Compliance Elite", "Governance Pro", or "Clinical Pilot (90-Day)"
      const rawPlan = session.metadata?.planType || "Governance Pro";
      const normalizedPlan = rawPlan.toLowerCase();
      
      // 🚀 ELITE TIER LOGIC: 
      // If the plan name contains 'elite', we assign the 'elite' tier to unlock restricted features.
      const finalTier = normalizedPlan.includes("elite") ? "elite" : "pro";

      const priceAmount = session.amount_total ? session.amount_total / 100 : 0;

      console.log(`🔄 DB SYNC: Setting ${userEmail} to Tier: ${finalTier.toUpperCase()} | Plan: ${rawPlan}`);

      // 🎯 FIRESTORE PERSISTENCE
      // .set with { merge: true } preserves other user document fields (like settings or azure credentials).
      await db.collection("users").doc(userEmail).set({
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        plan: normalizedPlan, // Saves as 'compliance elite'
        tier: finalTier,      // Saves as 'elite' for usePermissions hook
        isPro: true,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      // 🎯 TRIGGER NOTIFICATION
      // This will now correctly send "Compliance Elite" to your email for $1899 sales.
      await notifyAdminOfUpgrade(userEmail, rawPlan, "upgraded", priceAmount);
      
      console.log(`✅ WEBHOOK PROCESSED: ${userEmail} is now fully authorized.`);
      break;
    }

    /**
     * SUBSCRIPTION CANCELED
     * Fired when a user cancels via the portal or a subscription fails to renew.
     */
    case "customer.subscription.deleted": {
      console.log("🔔 [EVENT] customer.subscription.deleted detected.");
      
      const stripeCustomerId = session.customer;
      
      // Find the user by Stripe Customer ID to revert permissions.
      const userQuery = await db.collection("users")
        .where("stripeCustomerId", "==", stripeCustomerId)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const email = userDoc.id;

        console.log(`⚠️ ACCESS REVOKED: Reverting ${email} to free tier.`);

        await userDoc.ref.update({
          plan: "free",
          tier: "free",
          isPro: false,
          canceledAt: FieldValue.serverTimestamp()
        });

        // Notify admin of the loss of revenue
        await notifyAdminOfUpgrade(email, "Reverted to Free", "canceled");
        console.log(`❌ SUBSCRIPTION TERMINATED: ${email} access downgraded.`);
      } else {
        console.warn(`⚠️ CANCELLATION WARNING: Subscription deleted for unknown Stripe ID: ${stripeCustomerId}`);
      }
      break;
    }

    /**
     * OPTIONAL: INVOICE PAYMENT SUCCEEDED
     * Useful for recurring monthly billing updates if needed.
     */
    case "invoice.payment_succeeded": {
      console.log("🔔 [EVENT] invoice.payment_succeeded detected (Skipping DB update to prevent overwriting).");
      break;
    }

    default:
      console.log(`ℹ️ UNHANDLED EVENT: ${event.type}. No action taken.`);
  }

  // Respond to Stripe within 2 seconds to confirm receipt of the webhook.
  return new NextResponse("Webhook Received", { status: 200 });
}