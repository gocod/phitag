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
    
    // --- 1. DETERMINE IF THIS IS A SALE OR A LOGIN ---
    // We only want to trigger "Sale" logic for actual Stripe/Subscription events
    const isSale = lowerEvent.includes('subscription') || lowerEvent.includes('checkout') || lowerEvent.includes('sale');
    const isLogin = lowerEvent.includes('login') || lowerEvent.includes('register');

    // --- 2. SET SENDER IDENTITY BASED ON EVENT ---
    let fromIdentity = '"PHItag System" <emilyli1965@gmail.com>';
    let subjectLine = `🔔 PHItag Alert: ${eventType}`;

    if (isLogin) {
      fromIdentity = '"PHItag Security" <security@phitag.app>';
      subjectLine = `🔐 Auth Alert: ${eventType}`;
    } else if (isSale) {
      fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';
      subjectLine = `💰 NEW SALE: ${livePlan}`;
    }

    // --- 3. ADMIN NOTIFICATION (The email to YOU) ---
    // We use a simpler template for Logins and the "Fancy" one for Sales
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: subjectLine,
      html: isSale ? `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #003366;">New Subscription Revenue</h2>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Plan:</strong> ${livePlan}</p>
          <p><strong>Event:</strong> ${eventType}</p>
        </div>
      ` : `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3 style="color: #475569;">System Event: ${eventType}</h3>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Plan Status:</strong> ${livePlan}</p>
        </div>
      `,
    });

    // --- 4. USER WELCOME EMAIL (Strictly only for Sales) ---
    if (isSale && userEmail !== 'emilyli1965@gmail.com') {
      const isElite = livePlan.toLowerCase().includes('elite');
      const brandColor = "#2563eb";
      
      const planFeatures = isElite 
        ? `<li><strong>Automated Tag Remediation</strong></li><li><strong>Infrastructure Traceback Map</strong></li><li><strong>HIPAA Audit Vault</strong></li>`
        : `<li><strong>Real-time Drift Detection</strong></li><li><strong>Weekly Compliance Scorecards</strong></li><li><strong>Manual Remediation Hooks</strong></li>`;

      await transporter.sendMail({
        from: '"PHItag Governance" <onboarding@phitag.app>',
        to: userEmail, // THIS GOES TO THE CUSTOMER
        subject: `Welcome to PHItag ${livePlan}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
            <div style="background-color: ${brandColor}; padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Welcome to ${livePlan}</h1>
            </div>
            <div style="padding: 40px;">
              <p>Your subscription is active. Your environment is now protected.</p>
              <ul style="color: #475569; font-size: 14px;">${planFeatures}</ul>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.phitag.app/login" style="background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold;">Go to Dashboard</a>
              </div>
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