import "server-only"
import User, { type IUser } from "@/modals/User";
import { type Schedule } from "@/modals/Schedule";
import connectDB from "./connectDB";

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
    const user = (await User.findOne({ clerkId }).lean()) as IUser | null;
    return user?.weeklySchedule || {};
}