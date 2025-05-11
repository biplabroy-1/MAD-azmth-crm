import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/modals/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const clerkId = request.headers.get("x-clerk-user-id");
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body data
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { message: "Document content is required" },
        { status: 400 }
      );
    }

    // Fetch the user record
    const userRecord = await User.findOne({
      clerkId: "user_2wfPmDwyfTiAxm4XWzW3ICyPiER",
    });
    console.log(userRecord);

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if assistant already exists
    if (userRecord.assistantId) {
      return NextResponse.json({
        message: "Assistant already created",
        id: userRecord.assistantId,
      });
    }

    const { firstName } = userRecord;

    // Create Assistant (POST /assistant)
    const response = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.5,
          messages: [
            {
              content: content, // Use the uploaded document content here
              role: "system",
            },
          ],
        },
        voice: {
          provider: "vapi",
          voiceId: "Elliot",
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-3",
          language: "en",
          confidenceThreshold: 0.4,
          numerals: false,
          endpointing: 300,
        },
        startSpeakingPlan: {
          waitSeconds: 0.4,
          smartEndpointingPlan: {
            provider: "livekit",
            waitFunction: "20 + 500 * sqrt(x) + 2500 * x^3",
          },
          transcriptionEndpointingPlan: {
            onPunctuationSeconds: 0.1,
            onNoPunctuationSeconds: 1.5,
            onNumberSeconds: 0.5,
          },
        },
        serverMessages: [
          "conversation-update",
          "end-of-call-report",
          "function-call",
          "hang",
          "speech-update",
          "status-update",
          "tool-calls",
          "transfer-destination-request",
          "user-interrupted",
        ],
        clientMessages: [
          "conversation-update",
          "function-call",
          "hang",
          "model-output",
          "speech-update",
          "status-update",
          "transfer-update",
          "transcript",
          "tool-calls",
          "user-interrupted",
          "voice-input",
          "workflow.node.started",
        ],
        backgroundDenoisingEnabled: false,
        hipaaEnabled: false,
        name: `${firstName}'s Assistant`,
        firstMessage:
          "Thank you for calling Us. This is Cognia, your scheduling assistant. How may I help you today?",
        voicemailMessage:
          "Hello, this is Riley from Wellness Partners. I'm calling about your appointment. Please call us back at your earliest convenience so we can confirm your scheduling details.",
        endCallMessage:
          "Perfect! Your appointment has been scheduled. You'll receive a confirmation email shortly. Have a great day!",
      }),
    });

    const data = await response.json();
    const assistantId = data.id;

    // Update user record with new assistant ID
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          assistantId,
        },
      },
      { new: true, upsert: true }
    );

    console.log("Assistant created successfully:", updatedUser);
    return NextResponse.json({
      success: true,
      id: assistantId,
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
