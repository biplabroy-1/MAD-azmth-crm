// filepath: app/api/get-analytics/route.ts

import connectDB from "@/lib/connectDB";
import User, { IUser } from "@/modals/User";
import CallData from "@/modals/callData.model";
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

    // Find the user document to get the userId
    const userDoc = await User.findOne({ clerkId }).select('_id').lean() as IUser | null;
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const successOnly = searchParams.get("successOnly") === "true";
    const excludeVoicemail = searchParams.get("excludeVoicemail") === "true";
    const minDuration = parseInt(searchParams.get("minDuration") || "0", 10);
    const startDateRaw = searchParams.get("startDate");
    const endDateRaw = searchParams.get("endDate");

    // Build match conditions using the correct userId
    const matchConditions: any = { userId: userDoc._id };

    // Fix date filtering - use Date objects and correct field names
    if (startDateRaw || endDateRaw) {
      matchConditions.startedAt = {};
      if (startDateRaw) {
        matchConditions.startedAt.$gte = new Date(startDateRaw).toISOString();
      }
      if (endDateRaw) {
        matchConditions.startedAt.$lte = new Date(`${endDateRaw}T23:59:59.999Z`).toISOString();
      }
    }

    if (successOnly) {
      matchConditions["analysis.successEvaluation"] = "true";
    }

    if (excludeVoicemail) {
      matchConditions.endedReason = { $ne: "voicemail" };
    }

    if (!isNaN(minDuration) && minDuration > 0) {
      matchConditions.durationSeconds = { $gte: minDuration };
    }

    console.log('Match conditions:', matchConditions);

    const result = await CallData.aggregate([
      // Match the calls for this user with filters
      { $match: matchConditions },

      // Sort by most recent first
      { $sort: { startedAt: -1 } },

      // Group all matching calls for this user
      {
        $group: {
          _id: "$userId",
          matchingCalls: {
            $push: {
              _id: "$_id",
              analysis: "$analysis",
              startedAt: "$startedAt",
              endedReason: "$endedReason",
              durationSeconds: "$durationSeconds",
              transcript: "$transcript",
              recordingUrl: "$recordingUrl",
              call: {
                id: "$call.id",
                type: "$call.type",
                phoneNumber: "$call.phoneNumber.twilioPhoneNumber"
              },
              customer: "$customer",
              assistant: {
                id: "$assistant.id",
                name: "$assistant.name"
              }
            }
          },
          totalCalls: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      data: result.length > 0 ? result[0].matchingCalls : { totalCalls: 0 },
      count: result.length > 0 ? result[0].totalCalls : 0
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in GET /api/get-analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}