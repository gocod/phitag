import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  console.log("🚀 NOTIFY ROUTE START");
  try {
    const { eventType, userEmail, newPlan } = await req.json();
    console.log(`📩 Data Received - Event: ${eventType}, Email: ${userEmail}`);

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'a2f177001@smtp-brevo.com',
        pass: process.env.BREVO_PASSWORD, 
      },
    });

    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';

    // --- 1. ALWAYS SEND ADMIN ALERT ---
    console.log("📡 Attempting Admin Email...");
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: `🔔 DEBUG: ${eventType}`,
      html: `<p>Admin notification for ${userEmail}</p>`
    });
    console.log("✅ Admin Email Sent");

    // --- 2. ALWAYS SEND USER EMAIL (No Logic Gates) ---
    console.log(`📡 Attempting User Email to: ${userEmail}...`);
    await transporter.sendMail({
      from: fromIdentity,
      to: userEmail,
      subject: "Welcome to PHItag! 🛡️",
      html: `<h1>Testing Delivery</h1><p>If you see this, the code is working perfectly.</p>`
    });
    console.log("✅ User Email Sent");

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('❌ BREVO ROUTE ERROR:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}