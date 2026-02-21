import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail, newPlan, price } = await req.json();
    
    // Fallback: Use the newPlan if provided (upgrade), otherwise look up current plan (login)
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

    // 🎯 LOGIC GATE: Identify if this is a revenue event
    const isSale = lowerEvent.includes('sale') || lowerEvent.includes('upgrade') || lowerEvent.includes('completed');

    // --- 1. ADMIN NOTIFICATION (Revenue vs System Alert) ---
    // This confirms sales to you (Emily) immediately.
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: isSale ? `💰 NEW SALE: ${livePlan} ($${price || '?'})` : `🔔 PHItag: ${eventType}`,
      html: isSale ? `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #2563eb; border-radius: 10px;">
          <h2 style="color: #2563eb; margin-top: 0;">Revenue Alert! 🚀</h2>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Plan Purchased:</strong> ${livePlan}</p>
          <p><strong>Amount:</strong> $${price || 'N/A'}</p>
          <p style="font-size: 1.1em;">Check Stripe/Firebase for details.</p>
        </div>
      ` : `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <p><strong>System Event:</strong> ${eventType}</p>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Plan:</strong> ${livePlan}</p>
        </div>`
    });

    // --- 2. USER MESSAGES ---
    
    if (isSale) {
      // 🛡️ UPGRADE CONFIRMATION (The missing piece)
      await transporter.sendMail({
        from: fromIdentity,
        to: userEmail,
        subject: `Your ${livePlan} is now Active! 🛡️`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="text-align: center; color: #003366;">Welcome to Pro Access!</h2>
            <p>Hi there,</p>
            <p>Your upgrade to the <strong>${livePlan}</strong> was successful. Your account has been updated with full premium features.</p>
            
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #003366;">
              <p style="margin: 0; font-weight: bold; color: #003366;">Premium Features Unlocked:</p>
              <ul style="padding-left: 20px;">
                <li><strong>Full Azure Automation:</strong> Auto-tagging and Remediation</li>
                <li><strong>Unlimited Audit Vault:</strong> Complete history for HIPAA compliance</li>
                <li><strong>Priority Support:</strong> Direct access to the governance team</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://phitag.app/dashboard" style="background-color: #003366; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Enter the Pro Dashboard</a>
            </div>
            
            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
              If you have any questions about your new features, just reply to this email.
            </p>
          </div>`
      });
    } else {
      // 👋 STANDARD WELCOME (The Login/Signup Table)
      await transporter.sendMail({
        from: fromIdentity,
        to: userEmail,
        subject: 'Welcome to PHItag! 🛡️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #003366; text-align: center;">Secure Your Cloud Governance</h2>
            <p>Thanks for joining PHItag. You are currently on the <strong>Free Trial</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Feature</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Free</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #2563eb;">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Azure Automation</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Manual</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">✅ Full Auto</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Audit Vault</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Standard</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">✅ Unlimited</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://phitag.app/pricing" style="background-color: #003366; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Upgrade My Plan</a>
            </div>
          </div>`
      });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('❌ NOTIFY ERROR:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}