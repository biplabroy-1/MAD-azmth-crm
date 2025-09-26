"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/connectDB";
import User, { IUser } from "@/modals/User";

interface TwilioConfigData {
    sid: string;
    authToken: string;
    phoneNumber: string;
    content?: string;
}

export async function getTwilioConfig(): Promise<TwilioConfigData | null> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ clerkId: userId }).lean() as IUser | null;
    if (!user || !user.twilioConfig) return null;

    return {
        sid: user.twilioConfig.sid,
        authToken: user.twilioConfig.authToken,
        phoneNumber: user.twilioConfig.phoneNumber,
    };
}

export async function saveTwilioConfig(data: TwilioConfigData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();

    await User.findOneAndUpdate(
        { clerkId: userId },
        {
            $set: {
                twilioConfig: {
                    sid: data.sid,
                    authToken: data.authToken,
                    phoneNumber: data.phoneNumber,
                },
            },
        },
        { upsert: true }
    );

    return { success: true };
}
