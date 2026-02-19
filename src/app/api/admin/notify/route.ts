import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail } = await req.json();
    const livePlan = (await getUserPlan(userEmail)) || "Free Trial";

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'emilyli1965@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const lowerEvent = eventType.toLowerCase();
    
    // 🎯 STRICT LOGIC GATES
    // Only "checkout.session.completed" or explicit "sale" triggers Sale logic
    const isActualSale = lowerEvent.includes('completed') || lowerEvent.includes('sale');
    // Login and Register events
    const isAuthEvent = lowerEvent.includes('login') || lowerEvent.includes('register') || lowerEvent.includes('new user');
    
    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';

    // --- 1. ADMIN NOTIFICATION (To emilyli1965@gmail.com) ---
    // This ensures the Subject Line matches the actual reality
    let subject = `🔔 System: ${eventType}`;
    if (isActualSale) subject = `💰 NEW SALE: ${livePlan}`;
    if (isAuthEvent && !lowerEvent.includes('register')) subject = `🔐 Auth: ${userEmail}`;

    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: subject,
      html: `
        <div style="font-family:sans-serif; padding:20px; border:1px solid #eee; border-radius:12px;">
          <h3 style="color:#003366;">Platform Event Detected</h3>
          <p><b>Event:</b> ${eventType}</p>
          <p><b>User:</b> ${userEmail}</p>
          <p><b>Current Plan:</b> ${livePlan}</p>
        </div>`
    });

    // --- 2. USER WELCOME MESSAGE (With Pricing Table) ---
    // Only sent for New Users or Registrations to avoid spamming existing customers on every login
    if ((lowerEvent.includes('register') || lowerEvent.includes('new user')) && userEmail !== 'emilyli1965@gmail.com') {
      await transporter.sendMail({
        from: fromIdentity,
        to: userEmail,
        subject: "Welcome to PHItag - Secure Your Cloud Governance",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
            <div style="background-color: #003366; padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px;">Welcome to PHItag</h1>
            </div>
            <div style="padding: 30px; color: #334155;">
              <p>Thanks for joining. You are currently on the <strong>Free Trial</strong>.</p>
              <p>Upgrade to a professional tier for full HIPAA automation:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border: 1px solid #e2e8f0;">
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Feature</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Pro ($699)</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Elite ($1,899)</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">Automation</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Manual</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><strong>Full Auto</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">Audit Vault</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Standard</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Unlimited</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://phitag.app/pricing" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Plans</a>
              </div>
            </div>
          </div>`,
      });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}