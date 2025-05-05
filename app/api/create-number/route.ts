import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/connectDB";
import User from "@/modals/User";

export async function POST(request: NextRequest) {
  try {
    console.log("Get into create Number...");
    const { assistantId, sid, authToken, phoneNumber,clerkId } = await request.json();

    await connectDB();

    // Assuming you have a User model and you want to fetch the user's Twilio configuration
    const userRecord = await User.findOne({ clerkId });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { firstName } = userRecord;

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
        name: firstName + "'s Number",
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
