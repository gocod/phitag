import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  
  // 1. Robust Signature Retrieval
  // Using lowercase 'stripe-signature' is more reliable across different hosting providers
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Webhook Error: No stripe-signature found in headers");
    return new NextResponse("No signature found", { status: 400 });
  }

  let event;

  try {
    // 2. Construct the Event
    // Ensure process.env.STRIPE_WEBHOOK_SECRET is the one from the Stripe Dashboard (whsec_...)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Webhook Signature Verification Failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // 3. Handle the Events
  switch (event.type) {
    
    case "checkout.session.completed":
      const userEmail = session.customer_details?.email;
      const planType = session.metadata?.planType || "PHI_GOVERNANCE_SUITE"; 
      const stripeCustomerId = session.customer;

      console.log(`✅ SUCCESS: ${userEmail} (ID: ${stripeCustomerId}) purchased ${planType}`);

      /**
       * TODO: DATABASE SYNC
       * Since you are testing live, this is where you would call your DB:
       * await db.user.update({
       * where: { email: userEmail },
       * data: { 
       * isPro: true,
       * stripeCustomerId: stripeCustomerId,
       * plan: planType 
       * }
       * });
       */
      break;

    case "customer.subscription.deleted":
      const deletedSession = event.data.object as any;
      console.log(`❌ SUBSCRIPTION ENDED: Customer ${deletedSession.customer}`);
      
      /**
       * TODO: LOCK ACCESS
       * await db.user.update({
       * where: { stripeCustomerId: deletedSession.customer },
       * data: { isPro: false }
       * });
       */
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // 4. Return 200 to Stripe
  // Stripe will keep retrying (and potentially disable your webhook) if you don't return 200
  return new NextResponse("Webhook Received", { status: 200 });
}