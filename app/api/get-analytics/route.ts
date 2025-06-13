import connectDB from "@/lib/connectDB";
import User from "@/modals/User";
import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const clerkId = user?.id;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const successOnly = searchParams.get("successOnly") === "true";
    const excludeVoicemail = searchParams.get("excludeVoicemail") === "true";
    const minDuration = parseInt(searchParams.get("minDuration") || "0", 10);
    const startDateRaw = searchParams.get("startDate");
    const endDateRaw = searchParams.get("endDate");

    const matchConditions: any = {};

    if (startDateRaw) {
      matchConditions["fullCallData.startedAt"] = {
        ...(matchConditions["fullCallData.startedAt"] || {}),
        $gt: new Date(startDateRaw).toISOString()
      };
    }

    if (endDateRaw) {
      matchConditions["fullCallData.startedAt"] = {
        ...(matchConditions["fullCallData.startedAt"] || {}),
        $lte: new Date(`${endDateRaw}T23:59:59.999Z`).toISOString()
      };
    }

    if (successOnly) {
      matchConditions["fullCallData.analysis.successEvaluation"] = "true";
    }

    if (excludeVoicemail) {
      matchConditions["fullCallData.endedReason"] = { $ne: "voicemail" };
    }

    if (!isNaN(minDuration) && minDuration > 0) {
      matchConditions["fullCallData.durationSeconds"] = { $gt: minDuration };
    }

    const users = await User.aggregate([
      { $match: { clerkId } },
      { $unwind: "$fullCallData" },
      { $match: matchConditions },
      {
        $group: {
          _id: "$clerkId",
          matchingCalls: {
            $push: {
              analysis: "$fullCallData.analysis",
              startedAt: "$fullCallData.startedAt",
              endedReason: "$fullCallData.endedReason",
              durationSeconds: "$fullCallData.durationSeconds",
              transcript: "$fullCallData.transcript",
              recordingUrl: "$fullCallData.recordingUrl",
              call: {
                id: "$fullCallData.call.id",
                type: "$fullCallData.call.type",
                phoneNumber: "$fullCallData.call.phoneNumber.twilioPhoneNumber"
              },
              customer: "$fullCallData.customer",
              assistant: {
                id: "$fullCallData.assistant.id",
                name: "$fullCallData.assistant.name"
              }
            }
          }
        }
      }
    ]);

    return NextResponse.json({ data: users }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in GET /api/get-analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
