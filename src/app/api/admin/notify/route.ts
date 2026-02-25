import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail, newPlan, price } = await req.json();
    
    // 🔑 QUIET MODE: Exit early for re-sign-ins. No email to user or admin.
    const lowerEvent = eventType.toLowerCase();
    const isSignIn = lowerEvent.includes('login') || 
                     lowerEvent.includes('sign-in') || 
                     lowerEvent.includes('authenticated');

    if (isSignIn) {
      return Response.json({ success: true, message: "Quiet Mode: Sign-in ignored" });
    }

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

    const fromIdentity = '"PHItag Governance" <onboarding@phitag.app>';

    // 🎯 FIX: Added 'checkout' and 'completed' to make sure Stripe triggers the upgrade email
    const isSale = lowerEvent.includes('sale') || 
                   lowerEvent.includes('upgrade') || 
                   lowerEvent.includes('completed') || 
                   lowerEvent.includes('checkout') || 
                   lowerEvent.includes('subscription');

    // --- 1. ADMIN NOTIFICATION ---
    await transporter.sendMail({
      from: fromIdentity,
      to: 'emilyli1965@gmail.com',
      subject: isSale ? `💰 NEW SALE: ${livePlan} ($${price || '?'})` : `🔔 PHItag: ${eventType}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #2563eb; border-radius: 12px;">
          <h2 style="color: #2563eb; margin: 0;">${isSale ? 'Revenue Alert! 🚀' : 'System Alert 🔔'}</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
          <p><strong>Event:</strong> ${eventType}</p>
          <p><strong>Customer:</strong> ${userEmail}</p>
          <p><strong>Plan:</strong> ${livePlan}</p>
          ${price ? `<p><strong>Amount:</strong> $${price}</p>` : ''}
        </div>`
    });

    // --- 2. USER MESSAGES ---
    let emailSubject = 'Welcome to PHItag! 🛡️';
    let emailBody = '';

   if (isSale) {
      // 🏆 DYNAMIC UPGRADE CONFIRMATION
      emailSubject = `Your ${livePlan} Access is Now Active! 🛡️`;
      
      // Determine if this is an Elite plan to show higher-tier benefits
      const isElite = livePlan.toLowerCase().includes('elite');

      const featureList = isElite 
        ? `<li><strong>Auto-Remediation:</strong> Fixing compliance gaps in real-time.</li>
           <li><strong>Audit Vault:</strong> Full historical logs for HIPAA/SOC2 audits.</li>
           <li><strong>Priority Support:</strong> Direct access to the PHItag compliance desk.</li>`
        : `<li><strong>Real-time Scanning:</strong> Detecting infrastructure drift as it happens.</li>
           <li><strong>Audit Vault:</strong> Standard logging for clinical reviews.</li>
           <li><strong>Standard Support:</strong> 24-hour response time for governance queries.</li>`;

      emailBody = `
        <h2 style="text-align: center; color: #003366; margin-bottom: 20px;">Upgrade Successful!</h2>
        <p>Your environment is now secured with <strong>${livePlan}</strong> features. Your automated governance is now fully active.</p>
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #003366;">
          <h4 style="margin: 0 0 10px 0; color: #003366;">Enterprise Capabilities Unlocked:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            ${featureList}
          </ul>
        </div>`;
    } else {
      // 👋 RESTORED: HIGH-DETAIL WELCOME TABLE
      emailBody = `
        <div style="text-align: center; background-color: #003366; padding: 30px; border-radius: 15px 15px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 26px;">Welcome to PHItag</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 15px 15px;">
          <p style="color: #475569; font-size: 16px;">Thanks for joining. Your environment is now connected. You are currently on the <strong>Free Trial</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; color: #1e293b;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 15px; border: 1px solid #e2e8f0; text-align: left;">Feature</th>
                <th style="padding: 15px; border: 1px solid #e2e8f0; text-align: center;">Pro ($699)</th>
                <th style="padding: 15px; border: 1px solid #e2e8f0; text-align: center;">Elite ($1,899)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">Azure Automation</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Manual</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">Full Auto</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">Audit Vault</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Standard</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">Unlimited</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">AI Governance</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">Basic</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">Advanced</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">HIPAA Guard</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">-</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">24/7 Monitored</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 35px;">
            <a href="https://phitag.app/pricing" style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View All Plans</a>
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