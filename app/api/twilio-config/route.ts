import User from "@/modals/User";
import { type NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/connectDB";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId: clerkUser?.id });


    return NextResponse.json({
      twilioConfig: user?.twilioConfig || null,
      assistantId: user?.assistantId || null,
    });
  } catch (error) {
    console.error("Error retrieving Twilio configuration:", error);
    return NextResponse.json(
      { error: "Failed to retrieve Twilio configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { sid, authToken, phoneNumber } = await request.json();
    const clerkId = request.headers.get("x-clerk-user-id");

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          twilioConfig: {
            sid,
            authToken,
            phoneNumber,
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: "Twilio configuration updated successfully",
      twilioConfig: user.twilioConfig,
    });
  } catch (error) {
    console.error("Error updating Twilio configuration:", error);
    return NextResponse.json(
      { error: "Failed to update Twilio configuration" },
      { status: 500 }
    );
  }
}
