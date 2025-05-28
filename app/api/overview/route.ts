import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/modals/User';
import type { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        await connectDB();

        const aggregateResult = await User.aggregate([
            {
                $match: {
                    _id: user?.id
                }
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    callQueueLength: { $size: { $ifNull: ["$callQueue", []] } },
                    callQueueDoneLength: { $size: { $ifNull: ["$callQueueDone", []] } },
                    callQueueFailed: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$callQueueDone", []] },
                                as: "call",
                                cond: { $eq: ["$$call.status", "failed"] }
                            }
                        }
                    },
                    fullCallDataLength: { $size: { $ifNull: ["$fullCallData", []] } },
                    shortCalls: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$fullCallData", []] },
                                as: "call",
                                cond: { $lt: [{ $ifNull: ["$$call.duration", 0] }, 30] }
                            }
                        }
                    },
                    successfulAnalysis: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$fullCallData", []] },
                                as: "call",
                                cond: { $eq: [{ $ifNull: ["$$call.analysisStatus", ""] }, "complete"] }
                            }
                        }
                    },
                    callsWithAnalysis: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$fullCallData", []] },
                                as: "call",
                                cond: { $ne: [{ $ifNull: ["$$call.analysis", null] }, null] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    email: 1,
                    queueStats: {
                        totalInQueue: "$callQueueLength",
                        totalCompleted: "$callQueueDoneLength",
                        totalFailed: "$callQueueFailed",
                        successRate: {
                            $cond: [
                                { $eq: ["$callQueueDoneLength", 0] },
                                0,
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ["$callQueueDoneLength", "$callQueueFailed"] },
                                                "$callQueueDoneLength"
                                            ]
                                        },
                                        100
                                    ]
                                }
                            ]
                        }
                    },
                    callDataStats: {
                        totalCallRecords: "$fullCallDataLength",
                        shortCallsCount: "$shortCalls",
                        successfulAnalysisCount: "$successfulAnalysis",
                        callsWithAnalysis: "$callsWithAnalysis"
                    }
                }
            }
        ]);

        const userData = aggregateResult[0] || {
            email: user?.emailAddresses?.[0]?.emailAddress || "unknown",
            queueStats: { totalInQueue: 0, totalCompleted: 0, totalFailed: 0, successRate: 0 },
            callDataStats: {
                totalCallRecords: 0,
                shortCallsCount: 0,
                successfulAnalysisCount: 0,
                callsWithAnalysis: 0
            }
        };

        return NextResponse.json({ data: userData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}