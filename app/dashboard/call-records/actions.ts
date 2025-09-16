"use server";
import connectDB from "@/lib/connectDB";
import CallData from "@/modals/callData.model";
import { auth } from "@clerk/nextjs/server";

export async function getCallRecords({
    page = 1,
    limit = 100,
    assistantId = "all",
    phoneNumber = "all",
    startDate = "",
    endDate = "",
}: {
    page?: number;
    limit?: number;
    assistantId?: string;
    phoneNumber?: string;
    startDate?: string;
    endDate?: string;
}) {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
        return { records: [], total: 0, page, totalPages: 1 };
    }

    const skip = (page - 1) * limit;

    // dynamic filter
    const query: any = { userId };

    if (assistantId && assistantId !== "all") {
        query["assistant.id"] = assistantId;
    }

    if (phoneNumber && phoneNumber !== "all") {
        query["call.phoneNumber.twilioPhoneNumber"] = phoneNumber;
    }

    if (startDate || endDate) {
        query.startedAt = {};
        if (startDate) query.startedAt.$gte = new Date(startDate);
        if (endDate) query.startedAt.$lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
        CallData.find(query)
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(limit),
        CallData.countDocuments(query),
    ]);

    return {
        records: JSON.parse(JSON.stringify(records)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
