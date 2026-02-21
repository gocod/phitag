import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail } = await req.json();
    const livePlan = (await getUserPlan(userEmail)) || "Free Trial";

    // 🚀 BREVO SMTP CONFIGURATION
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'a2f177001@smtp-brevo.com', // From your screenshot
        pass: process.env.BREVO_PASSWORD, // The mqpr... key
      },
    });

    const lowerEvent = eventType.toLowerCase();
    const isWelcomeEvent = lowerEvent.includes('login') || 
                           lowerEvent.includes('register') || 
                           lowerEvent.includes('sign-in');
    
    // ✅ PROFESSIONAL SENDER
    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';

    // 1. Admin Alert (To You)
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: `🔔 PHItag: ${eventType}`,
      html: `<p><b>User:</b> ${userEmail}</p><p><b>Plan:</b> ${livePlan}</p>`
    });

    // 2. Welcome Email (To User)
    if (isWelcomeEvent && userEmail !== 'emilyli1965@gmail.com') {
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
              <p>Thanks for joining. Your environment is now connected. You are currently on the <strong>Free Trial</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border: 1px solid #e2e8f0;">
                <tr style="background-color: #f8fafc;">
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Feature</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Pro</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Elite</th>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">Azure Automation</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Manual</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Full Auto</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://phitag.app/pricing" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Upgrade Now</a>
              </div>
            </div>
          </div>`,
      });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("❌ BREVO ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}