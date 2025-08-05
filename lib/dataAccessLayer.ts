import "server-only"
import User, { type IUser } from "@/modals/User";
import type { Schedule } from "@/types/interfaces";
import connectDB from "./connectDB";
import { CallQueue } from "@/modals/callQueue";
import { CallQueueDone } from "@/modals/callQueueDone";

export async function saveScheduleToDB(clerkId: string, schedule: Schedule) {
    await connectDB();

    const existingUser = await User.findOne({ clerkId });

    if (existingUser) {
        existingUser.weeklySchedule = schedule;
        await existingUser.save();
    } else {
        await User.create({ clerkId, weeklySchedule: schedule });
    }
}

export async function fetchUserSchedule(clerkId: string) {
    await connectDB();
    try {
        const user = await User.findOne({ clerkId }).select("weeklySchedule").lean() as IUser | null;
        return user?.weeklySchedule || {};
    } catch (error) {
        return error
    }
}

export async function getAssistantQueueStats(clerkId: string, assistantId: string) {
    try {
        await connectDB();

        // Fetch pending calls for the assistant
        const queued = await CallQueue.find({
            userId: clerkId,
            agentId: assistantId,
            status: "pending"
        })
            .select("agentId name number status createdAt")
            .lean();

        // Fetch completed and failed calls in parallel
        const [completed, failed] = await Promise.all([
            CallQueueDone.find({
                userId: clerkId,
                agentId: assistantId,
                status: "initiated"
            }).lean(),
            CallQueueDone.find({
                userId: clerkId,
                agentId: assistantId,
                status: { $in: ["failed"] }
            }).lean()
        ]);

        return { queued, completed, failed };
    } catch (error) {
        console.error("Error in getAssistantQueueStats:", error);
        return {
            queued: [],
            completed: [],
            failed: [],
            error: "Unable to fetch assistant queue stats"
        };
    }
}