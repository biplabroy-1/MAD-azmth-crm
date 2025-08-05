import { type NextRequest, NextResponse } from "next/server";
import { getAssistantQueueStats } from "@/lib/dataAccessLayer";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);

        const assistantId = searchParams.get("assistantId");

        if (!assistantId) {
            return NextResponse.json({ error: "Missing assistantId" }, { status: 400 });
        }
        // Fetch queue stats for the assistant
        const data = await getAssistantQueueStats(user.id, assistantId);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
    }
}
