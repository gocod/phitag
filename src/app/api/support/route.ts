import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { subject, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: 'a2f177001@smtp-brevo.com',
        pass: process.env.BREVO_PASSWORD, 
      },
    });

    // 🎯 DYNAMIC SENDER LOGIC
    // We keep onboarding@phitag.app separate for sales/signups only.
    let fromAddress = '"PHItag Support" <support@phitag.app>';
    
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('security') || lowerSubject.includes('vulnerability')) {
      fromAddress = '"PHItag Security" <security@phitag.app>';
    }

    // 📬 Forward the message to your admin inbox (emilyli1965)
    await transporter.sendMail({
      from: fromAddress,
      to: 'emilyli1965@gmail.com',
      replyTo: email, // This lets you hit "Reply" in Gmail to answer the user
      subject: `[${subject.toUpperCase()}] from ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 2px solid #e2e8f0; border-radius: 16px; max-width: 600px;">
          <h2 style="color: #003366; margin-top: 0;">New Inbound Request</h2>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Source:</strong> ${fromAddress.split('<')[0]}</p>
          <p style="margin: 10px 0;"><strong>User:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Topic:</strong> ${subject}</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 15px; border: 1px solid #edf2f7;">
            <p style="margin: 0; white-space: pre-wrap; font-size: 15px; color: #1a202c; line-height: 1.6;">${message}</p>
          </div>
          <p style="font-size: 11px; color: #a0aec0; margin-top: 25px; text-align: center;">
            Forwarded by PHItag API Relay
          </p>
        </div>`,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('❌ MAIL RELAY ERROR:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}