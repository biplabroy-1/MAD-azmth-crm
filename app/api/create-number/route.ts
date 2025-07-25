import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/modals/User";

export async function POST(request: NextRequest) {
  try {
    console.log("Get into create Number...");
    const { clerkId } = await request.json();

    await connectDB();

    // Fetch the user along with all their Twilio credentials
    const userRecord = await User.findOne({ clerkId });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { firstName, assistantId, twilioConfig } = userRecord;
    const { sid, authToken, phoneNumber } = twilioConfig;

    // Validate that all required fields exist
    if (!assistantId || !sid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required Twilio configuration" },
        { status: 400 }
      );
    }

    // Create Phone Number (POST /phone-number)
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "twilio",
        number: phoneNumber,
        twilioAccountSid: sid,
        assistantId: assistantId,
        twilioAuthToken: authToken,
        name: `${firstName}'s Number`,
      }),
    });
    const data = await response.json();
    console.log("API Response:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating calls:", error);
    return NextResponse.json(
      { error: "Failed to create calls" },
      { status: 500 }
    );
  }
}
