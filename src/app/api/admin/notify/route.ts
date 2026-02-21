import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail, newPlan, price } = await req.json();
    
    // Fallback: If no plan is in the request, try to get it from the database
    const livePlan = newPlan || (await getUserPlan(userEmail)) || "Free Trial";

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'a2f177001@smtp-brevo.com',
        pass: process.env.BREVO_PASSWORD, 
      },
    });

    const lowerEvent = eventType.toLowerCase();
    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';

    // 🎯 REFINED LOGIC: Added 'subscription' to catch your specific event
    const isSale = lowerEvent.includes('sale') || 
                   lowerEvent.includes('upgrade') || 
                   lowerEvent.includes('completed') || 
                   lowerEvent.includes('subscription'); // 👈 Added this!

    // --- 1. ADMIN NOTIFICATION (Confirmed Revenue) ---
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      // Updated subject to include the Plan and Price for you
      subject: isSale ? `💰 NEW SALE: ${livePlan} ($${price || '?'})` : `🔔 PHItag: ${eventType}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #2563eb; border-radius: 12px;">
          <h2 style="color: #2563eb; margin: 0;">${isSale ? 'Revenue Alert! 🚀' : 'System Alert 🔔'}</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
          <p><strong>Event Type:</strong> ${eventType}</p>
          <p><strong>Customer:</strong> ${userEmail}</p>
          <p><strong>Plan Tier:</strong> ${livePlan}</p>
          ${price ? `<p><strong>Amount:</strong> $${price}</p>` : ''}
        </div>`
    });

    // --- 2. USER MESSAGES ---
    let emailSubject = 'Welcome to PHItag! 🛡️';
    let emailBody = '';

    if (isSale) {
      // 🏆 CORRECT UPGRADE CONFIRMATION
      emailSubject = `Your ${livePlan} Access is Now Active! 🛡️`;
      emailBody = `
        <h2 style="text-align: center; color: #003366; margin-bottom: 20px;">Upgrade Successful!</h2>
        <p>Your environment is now secured with <strong>${livePlan}</strong> features. Your automated governance is now fully active.</p>
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #003366;">
          <h4 style="margin: 0 0 10px 0; color: #003366;">Enterprise Capabilities Unlocked:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Auto-Remediation:</strong> Fixing compliance gaps in real-time.</li>
            <li><strong>Audit Vault:</strong> Full historical logs for HIPAA/SOC2 audits.</li>
            <li><strong>Priority Support:</strong> Direct access to the PHItag compliance desk.</li>
          </ul>
        </div>`;
    } else {
      // 👋 STANDARD WELCOME TABLE
      emailBody = `
        <div style="text-align: center; background-color: #003366; padding: 25px; border-radius: 15px 15px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to PHItag</h1>
        </div>
        <div style="padding: 25px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 15px 15px;">
          <p style="color: #475569;">Thanks for joining. Your environment is now connected. You are currently on the <strong>Free Trial</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Feature</th>
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Pro</th>
                <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Elite</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">Automation</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Manual</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">Full Auto</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">Audit Vault</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Standard</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">Unlimited</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://phitag.app/pricing" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Plans</a>
          </div>
        </div>`;
    }

    await transporter.sendMail({
      from: fromIdentity,
      to: userEmail,
      subject: emailSubject,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: auto;">
          ${emailBody}
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px;">© 2026 PHItag Governance</p>
        </div>`
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('❌ NOTIFY ERROR:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}