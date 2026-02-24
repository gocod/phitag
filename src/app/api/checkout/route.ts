import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { priceId, userEmail, isTrial } = await req.json();

    // 1. Security Check
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Identify the Tier
    // The Pilot is a special case: we give them 90 days of "Pro" for free.
    const isPilot = isTrial || priceId === "pilot_90_day";
    
    // 3. Resolve the Stripe Price ID
    // If it's a pilot, we MUST use the Pro ID from your environment variables
    // so Stripe knows what to charge once the 90 days are up.
    const finalPriceId = isPilot 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO 
      : priceId;

    if (!finalPriceId || finalPriceId.includes("MISSING")) {
      return NextResponse.json({ error: "Stripe Price ID configuration is missing." }, { status: 400 });
    }

    // 4. Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userEmail, 

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      
      // 🚀 TRIAL ENGINE
      // This tells Stripe: "Don't charge yet. Wait 90 days, then bill the card."
      subscription_data: {
        trial_period_days: isPilot ? 90 : undefined,
        metadata: {
          userEmail: userEmail,
          isTrial: isPilot ? "true" : "false",
          planTarget: isPilot ? "Pro" : "Standard"
        }
      },

      metadata: {
        project: "PHItag Governance",
        userEmail: userEmail,
        planType: isPilot ? "Clinical Pilot (90-Day)" : "Standard Subscription"
      },

      // Collects card info for Pilot users so the auto-upgrade works seamlessly
      payment_method_collection: 'always',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}