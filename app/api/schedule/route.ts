import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User, { IUser } from '@/modals/User';
import { getCurrentDayOfWeek, getCurrentTimeSlot } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        // Wait for the current user response
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const clerkId = user.id;
        await connectDB();

        const { weeklySchedule } = await request.json();

        const userDoc = await User.findById(clerkId);
        if (!userDoc) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (weeklySchedule) {
            userDoc.weeklySchedule = weeklySchedule;
            await userDoc.save();
        }

        return NextResponse.json({
            message: 'Schedule updated successfully',
            weeklySchedule: userDoc.weeklySchedule,
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
    try {
        // Wait for the current user response
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const clerkId = user.id;
        await connectDB();

        const userDoc = await User.findById(clerkId).select("_id weeklySchedule") as IUser;
        if (!userDoc) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const currentDay = getCurrentDayOfWeek();
        const currentTimeSlot = getCurrentTimeSlot(userDoc.weeklySchedule, currentDay);

        return NextResponse.json({
            weeklySchedule: userDoc.weeklySchedule || {},
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
