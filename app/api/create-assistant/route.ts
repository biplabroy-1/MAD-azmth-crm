import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/modals/User";
import { auth } from "@clerk/nextjs/server";
import { createVapiAssistant } from "@/lib/vapiHelper";
import AssistantModel from "@/modals/Assistant";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { firstName, systemPrompt, firstMessage, endCallMessage } = await request.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make sure user exists in MongoDB
    const userRecord = await User.findOne({ clerkId: userId });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if assistant already exists for this user
    const existingAssistant = await AssistantModel.findOne({ userId });
    if (existingAssistant) {
      return NextResponse.json({
        message: "Assistant already created",
        id: existingAssistant.id,
      });
    }

    // Create assistant via external API
    const response = await createVapiAssistant(firstName, systemPrompt, firstMessage, endCallMessage);
    if (!response || (typeof response === "object" && "error" in response)) {
      return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
    }

    // Save assistant in Assistants collection
    const assistant = await AssistantModel.create({
      userId, // Clerk user ID
      ...response,
    });

    console.log("Assistant created successfully:", assistant);

    return NextResponse.json({
      success: true,
      id: assistant.id,
      message: "Assistant created successfully",
    });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json(
      { error: "Failed to create assistant" },
      { status: 500 }
    );
  }
}
