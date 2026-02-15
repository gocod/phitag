import { Resend } from 'resend';
import { getUserPlan } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { eventType, userEmail } = await req.json();

    // 1. Get real-time plan from Firebase
    // If getUserPlan fails, we fallback to "Unknown" so the email still sends
    const livePlan = (await getUserPlan(userEmail)) || "Free Trial (Default)";

    const data = await resend.emails.send({
      from: 'PHItag System <system@phitag.app>', // Ensure this domain is verified in Resend!
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

    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ Notification Route Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}