"use server";
import connectDB from "@/lib/connectDB";
import CallData from "@/modals/callData.model";
import { auth } from "@clerk/nextjs/server";

export async function getCallRecords({ page = 1, limit = 100 }: { page?: number; limit?: number }) {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
        return { records: [], total: 0, page, totalPages: 1 };
    }
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
        CallData.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        CallData.countDocuments({ userId }),
    ]);
    return {
        records,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
