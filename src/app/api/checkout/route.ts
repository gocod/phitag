import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { priceId, userEmail, isTrial } = await req.json();

    // 1. Security Check
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Identify the Tiers via Environment Variables
    const PRO_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
    const ELITE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE;

    // The Pilot is a special case: 90 days of Pro for free.
    const isPilot = isTrial || priceId === "pilot_90_day";
    const isElite = priceId === ELITE_ID;
    
    // 3. Resolve the Stripe Price ID
    const finalPriceId = isPilot ? PRO_ID : priceId;

    if (!finalPriceId || finalPriceId.includes("MISSING")) {
      return NextResponse.json({ error: "Stripe Price ID configuration is missing." }, { status: 400 });
    }

    // 🎯 DYNAMIC NAMING: This fixes your Admin Email and Firebase logic
    let displayPlanName = "Governance Pro"; // Default
    if (isPilot) {
      displayPlanName = "Clinical Pilot (90-Day)";
    } else if (isElite) {
      displayPlanName = "Compliance Elite";
    }

    // 4. Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userEmail, 

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${isElite ? 'elite' : 'pro'}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      
      subscription_data: {
        trial_period_days: isPilot ? 90 : undefined,
        metadata: {
          userEmail: userEmail,
          isTrial: isPilot ? "true" : "false",
          // Helps the webhook identify the target plan after trial
          planTarget: isPilot ? "Pro" : (isElite ? "Elite" : "Pro")
        }
      },

      metadata: {
        project: "PHItag Governance",
        userEmail: userEmail,
        // 🚀 THIS IS THE KEY FIX: Passes "Compliance Elite" or "Governance Pro" to the webhook
        planType: displayPlanName 
      },

      payment_method_collection: 'always',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}