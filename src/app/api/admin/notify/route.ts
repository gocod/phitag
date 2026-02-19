import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail } = await req.json();
    const livePlan = (await getUserPlan(userEmail)) || "Governance Pro"; 

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'emilyli1965@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const lowerEvent = eventType.toLowerCase();
    const isUpgrade = lowerEvent.includes('subscription') || lowerEvent.includes('checkout') || lowerEvent.includes('completed');

    // --- 1. ALIGN WITH PRICING PAGE ---
    const isElite = livePlan.toLowerCase().includes('elite');
    const planDisplayTitle = isElite ? "Compliance Elite" : "Governance Pro";
    
    // Using the "Recommended" Blue for both to keep it simple, or Slate for Pro
    const brandColor = "#2563eb"; // matches your blue-600
    
    const planFeatures = isElite 
      ? `<li><strong>Automated Tag Remediation</strong></li>
         <li><strong>Infrastructure Traceback Map</strong></li>
         <li><strong>HIPAA Audit Vault</strong></li>
         <li>Priority Support (2h Response)</li>`
      : `<li><strong>Real-time Drift Detection</strong></li>
         <li><strong>Weekly Compliance Scorecards</strong></li>
         <li><strong>Manual Remediation Hooks</strong></li>
         <li>Standard BAA Included</li>`;

    // --- 2. ADMIN ALERT ---
    await transporter.sendMail({
      from: '"PHItag System" <emilyli1965@gmail.com>',
      to: 'emilyli1965@gmail.com',
      subject: `💰 NEW SALE: ${planDisplayTitle}`,
      html: `<p><strong>Success!</strong> ${userEmail} just subscribed to <b>${planDisplayTitle}</b>.</p>`,
    });

    // --- 3. USER WELCOME (Clean & No Logo) ---
    if (isUpgrade) {
      await transporter.sendMail({
        from: '"PHItag Governance" <onboarding@phitag.app>',
        to: userEmail,
        subject: `Welcome to PHItag ${planDisplayTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
            <div style="background-color: ${brandColor}; padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.025em;">PHItag ${planDisplayTitle.toUpperCase()}</h1>
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
              <p style="font-size: 16px;">Hello,</p>
              <p>Your subscription to <strong>${planDisplayTitle}</strong> is now active. Your environment is now protected against cloud resource drift.</p>
              
              <div style="background-color: #f8fafc; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; tracking: 0.1em;">Included in your plan:</h3>
                <ul style="padding-left: 20px; color: #475569; font-size: 14px;">
                  ${planFeatures}
                </ul>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="https://www.phitag.app/login" style="background-color: #0f172a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Launch Dashboard</a>
              </div>

              <p style="font-size: 14px;">Questions? Reach out to our compliance team at <a href="mailto:support@phitag.app" style="color: ${brandColor}; text-decoration: none; font-weight: bold;">support@phitag.app</a>.</p>
              
              <p style="margin-top: 40px; font-size: 14px;">Best,<br /><strong>The PHItag Team</strong></p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; 2026 PHItag. Zero-data liability architecture.
            </div>
          </div>
        `,
      });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("❌ Notification Route Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}