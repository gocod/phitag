import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail, newPlan, price } = await req.json();
    
    // Fallback logic to get plan from DB if not provided in the request
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

    // --- LOGIC GATES ---
    const isSale = lowerEvent.includes('sale') || lowerEvent.includes('upgrade') || lowerEvent.includes('completed');

    // --- 1. ADMIN ALERT (The Emily Alert) ---
    let adminSubject = `🔔 PHItag: ${eventType}`;
    let adminBody = `<p><b>User:</b> ${userEmail}</p><p><b>Event:</b> ${eventType}</p>`;

    if (isSale) {
      adminSubject = `💰 NEW SALE: ${livePlan} ($${price || 'N/A'})`;
      adminBody = `
        <div style="border: 2px solid #2563eb; padding: 15px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Cha-Ching! PHItag Upgrade</h2>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Plan:</strong> ${livePlan}</p>
          <p><strong>Amount:</strong> $${price || 'N/A'}</p>
        </div>`;
    }

    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: adminSubject,
      html: adminBody
    });

    // --- 2. USER MESSAGES ---

    if (isSale) {
      // 🃏 UPGRADE CONFIRMATION (BaccaPro Style)
      await transporter.sendMail({
        from: fromIdentity,
        to: userEmail,
        subject: `Your ${livePlan} is now Active! 🛡️`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="text-align: center; color: #003366;">Welcome to Pro Access!</h2>
            <p>Hi there,</p>
            <p>Your upgrade to <strong>${livePlan}</strong> was successful. Your account has been updated with full premium automation features.</p>
            
            <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #003366;">
              <p style="margin: 0; font-weight: bold; color: #003366;">Your New PHItag Features:</p>
              <ul style="padding-left: 20px;">
                <li>Full Azure HIPAA Automation</li>
                <li>Unlimited Audit Vault History</li>
                <li>Advanced Compliance Reporting</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://phitag.app/dashboard" style="background-color: #003366; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Enter My Dashboard</a>
            </div>
            
            <p style="font-size: 12px; color: #888; text-align: center;">If you have any questions, simply reply to this email.</p>
          </div>`
      });
    } else {
      // 👋 WELCOME MESSAGE (For Sign-ins/Registrations)
      await transporter.sendMail({
        from: fromIdentity,
        to: userEmail,
        subject: 'Welcome to PHItag! 🛡️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #003366; text-align: center;">Secure Your Cloud Governance</h2>
            <p>Thanks for joining PHItag. Your environment is now connected. You are currently on the <strong>${livePlan}</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Feature</th>
                  <th style="padding: 12px; border: 1px solid #ddd;">Free Trial</th>
                  <th style="padding: 12px; border: 1px solid #ddd; color: #2563eb;">Pro</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Azure Automation</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Manual</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">✅ Auto</td>
                </tr>
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