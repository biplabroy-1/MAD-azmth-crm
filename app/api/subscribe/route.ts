import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // 1️⃣ Send thank-you email to the user
    await resend.emails.send({
      from: "Dron Guin <dronguin@azmth.in>",
      to: email,
      subject: "Thank You for Joining the Azmth Waitlist",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for signing up for the Azmth waitlist! We’re thrilled to have you on board and will keep you updated as soon as spots become available.</p>
        <p>We appreciate your patience and interest in Azmth.</p>
        <p>Warm regards,<br/>The Azmth Team</p>
      `,
    });

    // 2️⃣ Send notification email to yourself
    await resend.emails.send({
      from: "Azmth HQ <mail@azmth.in>",
      to: "dronguin@azmth.in",
      subject: "New Submission Received",
      html: `<p>Name: ${name}</p><p>Email: ${email}</p>`,
    });

    // 3️⃣ Send data to SheetDB
    await fetch("https://sheetdb.io/api/v1/z11d993ztxi10", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            name,
            email,
            submitted_at: new Date().toLocaleString(),
          },
        ],
      }),
    });

    return NextResponse.json({ message: "Emails sent and data saved successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
