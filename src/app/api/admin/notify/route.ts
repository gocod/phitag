import nodemailer from 'nodemailer';
import { getUserPlan } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { eventType, userEmail } = await req.json();

    // 1. Get real-time plan from Firebase
    const livePlan = (await getUserPlan(userEmail)) || "Free Trial (Default)";

    // 2. Configure Nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'emilyli1965@gmail.com', // Your Gmail
        pass: process.env.GMAIL_APP_PASSWORD, // ⚠️ You must generate this in Google Account settings
      },
    });

    // 3. Send the Email
    const info = await transporter.sendMail({
      from: '"PHItag System" <emilyli1965@gmail.com>',
      to: 'emilyli1965@gmail.com',
      subject: `🔔 PHItag Alert: ${eventType}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #003366;">PHItag Platform Event</h2>
          <p><strong>Event:</strong> ${eventType}</p>
          <p><strong>User:</strong> ${userEmail}</p>
          <p style="font-size: 1.2rem; color: #10b981;">
            <strong>Current Plan:</strong> ${livePlan}
          </p>
          <hr />
          <p style="font-size: 10px; color: #999;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return Response.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("❌ Notification Route Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}