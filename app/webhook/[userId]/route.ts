import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import CallData from "@/modals/callData.model";
import User from "@/modals/User";

export async function POST(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");
        const payload = await request.json();

        if (!payload) {
            console.warn("⚠️ Invalid or missing payload in endOfCallReportHandler.");
            return NextResponse.json({ error: "Invalid or missing payload" }, { status: 400 });
        }

        const { message } = payload;
        if (message.type !== "end-of-call-report") {
            return NextResponse.json({ message: "Thanks" })
        }
        const assistantId = message?.assistant?.id;

        if (!assistantId) {
            console.warn("⚠️ No assistant ID found in payload message.");
            return NextResponse.json({ error: "No assistant ID found" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            console.warn(`⚠ No user found with assistant ID: ${assistantId}.`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const callData = new CallData({
            userId: user._id,
            ...message,
        });

        await callData.save();

        console.info(`✅ Call data saved to CallData for user ${user._id} using: ${callData._id}`);

        return NextResponse.json({ status: "success" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error saving call report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
