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
    
    // 🎯 LOGIC GATES
    const isActualSale = lowerEvent.includes('completed') || lowerEvent.includes('sale');
    const isWelcomeEvent = lowerEvent.includes('login') || 
                           lowerEvent.includes('register') || 
                           lowerEvent.includes('new user') || 
                           lowerEvent.includes('callback');
    
    // 🔐 DELIVERABILITY FIX: Using Gmail as sender address to pass SPF/DMARC checks for Yahoo
    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';
    const businessReplyTo = 'onboarding@phitag.app';

    // --- 1. ADMIN NOTIFICATION (To emilyli1965@gmail.com) ---
    let adminSubject = `🔔 System: ${eventType}`;
    if (isActualSale) adminSubject = `💰 NEW SALE: ${livePlan}`;
    if (isWelcomeEvent && !lowerEvent.includes('register')) adminSubject = `🔐 Auth: ${userEmail}`;

    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: adminSubject,
      html: `
        <div style="font-family:sans-serif; padding:20px; border:1px solid #eee; border-radius:12px;">
          <h3 style="color:#003366;">Platform Event Detected</h3>
          <p><b>Event:</b> ${eventType}</p>
          <p><b>User:</b> ${userEmail}</p>
          <p><b>Current Plan:</b> ${livePlan}</p>
        </div>`
    });

    // --- 2. USER WELCOME MESSAGE (To Customer/Yahoo) ---
    if (isWelcomeEvent && userEmail !== 'emilyli1965@gmail.com') {
      console.log(`📧 NOTIFY: Sending full welcome table to ${userEmail}`);

      await transporter.sendMail({
        from: fromIdentity,
        replyTo: businessReplyTo,
        to: userEmail,
        subject: "Welcome to PHItag - Secure Your Cloud Governance",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
            <div style="background-color: #003366; padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px;">Welcome to PHItag</h1>
            </div>
            <div style="padding: 30px; color: #334155;">
              <p>Thanks for joining. Your environment is now connected. You are currently on the <strong>Free Trial</strong>.</p>
              <p>Upgrade to a professional tier for full HIPAA automation:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Feature</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Pro ($699)</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Elite ($1,899)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">Azure Automation</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Manual</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;"><strong>Full Auto</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">Audit Vault</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Standard</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Unlimited</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e2e8f0;">HIPAA Reporting</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Basic</td>
                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Advanced</td>
                  </tr>
                </tbody>
              </table>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://phitag.app/pricing" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View All Plans</a>
              </div>
              
              <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; text-align: center;">
                If you have any questions, simply reply to this email to reach our support team.
              </p>
            </div>
          </div>`,
      });
      console.log(`✅ NOTIFY: Welcome email delivered to transport for ${userEmail}`);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("❌ NOTIFY ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}