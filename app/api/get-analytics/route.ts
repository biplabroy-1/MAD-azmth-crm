// filepath: app/api/get-analytics/route.ts

import connectDB from "@/lib/connectDB";
import User from "@/modals/User";
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

    const userDoc = await User.findOne({ clerkId });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const successOnly = searchParams.get("successOnly") === "true";
    const excludeVoicemail = searchParams.get("excludeVoicemail") === "true";
    const minDuration = parseInt(searchParams.get("minDuration") || "0", 10);
    const startDateRaw = searchParams.get("startDate");
    const endDateRaw = searchParams.get("endDate");

    const filters: any = { userId: userDoc._id };

    if (startDateRaw) {
      filters["startedAt"] = {
        ...(filters["startedAt"] || {}),
        $gt: new Date(startDateRaw).toISOString()
      };
    }

    if (endDateRaw) {
      filters["startedAt"] = {
        ...(filters["startedAt"] || {}),
        $lte: new Date(`${endDateRaw}T23:59:59.999Z`).toISOString()
      };
    }
    console.log(filters);
    

    if (successOnly) {
      filters["analysis.successEvaluation"] = "true";
    }

    if (excludeVoicemail) {
      filters.endedReason = { $ne: "voicemail" };
    }

    if (!isNaN(minDuration) && minDuration > 0) {
      filters.durationSeconds = { $gt: minDuration };
    }

    const calls = await CallData.find(filters)
      .sort({ startedAt: -1 })
      .select({
        _id:1,
        analysis: 1,
        startedAt: 1,
        endedReason: 1,
        durationSeconds: 1,
        transcript: 1,
        recordingUrl: 1,
        call: 1,
        customer: 1,
        assistant: 1
      })
      .lean();

    return NextResponse.json({ data: calls }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in GET /api/get-analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
