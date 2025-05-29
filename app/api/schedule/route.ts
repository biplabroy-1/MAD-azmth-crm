import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB'; // Adjust path as needed
import User, { IUser } from '@/modals/User'; // Adjust path as needed

import { getCurrentDayOfWeek, getCurrentTimeSlot } from '@/lib/utils'; // Adjust the path as necessary
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    const user = await currentUser();
    const clerkId = user?.id;
    try {
        await connectDB();

        const { weeklySchedule } = await request.json();

        if (!clerkId) {
            return NextResponse.json(
                { error: 'clerkId is required' },
                { status: 400 }
            );
        }

        const user = await User.findById(clerkId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (weeklySchedule) {
            user.weeklySchedule = weeklySchedule;
            await user.save();
        }

        return NextResponse.json({
            message: 'Schedule updated successfully',
            weeklySchedule: user.weeklySchedule,
        });
    } catch (err) {
        console.error(
            '❌ Schedule update error:',
            err instanceof Error ? err.message : String(err)
        );
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}


export async function GET(request: NextRequest) {
    const user = await currentUser();
    const clerkId = user?.id;
    try {
        await connectDB();

        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(clerkId).select("_id weeklySchedule") as IUser;
        if (!user) {
            return NextResponse.json(
                { error: "User  not found" },
                { status: 404 }
            );
        }

        const currentDay = getCurrentDayOfWeek();
        const currentTimeSlot = getCurrentTimeSlot(user.weeklySchedule, currentDay);

        return NextResponse.json({
            weeklySchedule: user.weeklySchedule || {},
            currentDay,
            currentTimeSlot,
        });
    } catch (err) {
        console.error("❌ Schedule get error:", err instanceof Error ? err.message : String(err));
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
