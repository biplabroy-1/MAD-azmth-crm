// app/api/call-records/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import CallData from "@/modals/callData.model";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await connectDB();
    const userId = "user_2x0DhdwrWfE9PpFSljdOd3aOvYG";

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      CallData.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CallData.countDocuments({ userId }),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching call records:", error);
    return NextResponse.json(
      { message: "Failed to fetch call records" },
      { status: 500 }
    );
  }
}
