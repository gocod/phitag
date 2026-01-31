import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Import your authOptions if you have them, or use your session logic
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(req: Request) {
  try {
    const { priceId, userEmail } = await req.json();

    // 1. Double check security: Ensure a user is actually logged in
    // This prevents random people from triggering checkout sessions
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      
      // Pass the email to pre-fill the Stripe form
      customer_email: userEmail,
      
      // IMPORTANT: This allows your webhook to link the payment back to your user
      client_reference_id: userEmail, 

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      
      // Metadata allows you to store custom info visible in the Stripe Dashboard
      metadata: {
        project: "PHItag Governance",
        userEmail: userEmail,
        planType: priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ? "Pro" : "Elite"
      },

      // This ensures the metadata is also attached to the Subscription object itself
      subscription_data: {
        metadata: {
          userEmail: userEmail,
        }
      },
      
      // Optional: allow promotion codes for early adopters
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}