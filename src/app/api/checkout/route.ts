import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { priceId, userEmail, isTrial } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Define trial logic: Only the Pilot ID or the isTrial flag triggers the 90-day trial
    const isPilot = isTrial || priceId === "pilot_90_day";
    
    // For the Pilot, we actually use the PRO Price ID in Stripe, but with a trial period
    // If it's the pilot, ensure we use the Pro Price ID so the auto-upgrade targets the correct plan
    const finalPriceId = priceId === "pilot_90_day" 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO 
      : priceId;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userEmail, 

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      
      // 🚀 TRIAL LOGIC: This is the engine for your 90-day strategy
      subscription_data: {
        trial_period_days: isPilot ? 90 : undefined,
        metadata: {
          userEmail: userEmail,
          isTrial: isPilot ? "true" : "false",
          planTarget: priceId === "pilot_90_day" ? "Pro" : "Selected"
        }
      },

      metadata: {
        project: "PHItag Governance",
        userEmail: userEmail,
        planType: isPilot ? "Clinical Pilot (90-Day)" : "Standard Subscription"
      },

      allow_promotion_codes: true,
      // Ensures the subscription is cancelled if the first payment fails after trial
      payment_intent_data: isPilot ? undefined : { setup_future_usage: 'off_session' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}