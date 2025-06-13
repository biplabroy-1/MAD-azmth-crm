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
                    callQueueArray: {
                        $reduce: {
                            input: { $objectToArray: { $ifNull: ["$callQueue", {}] } },
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this.v"] }
                        }
                    },
                    callQueueDoneArray: {
                        $reduce: {
                            input: { $objectToArray: { $ifNull: ["$callQueueDone", {}] } },
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this.v"] }
                        }
                    },
                    fullCallData: { $ifNull: ["$fullCallData", []] },
                    assistantQueueSizes: {
                        $map: {
                            input: { $objectToArray: { $ifNull: ["$callQueue", {}] } },
                            as: "entry",
                            in: {
                                k: "$$entry.k",
                                v: { $size: { $ifNull: ["$$entry.v", []] } }
                            }
                        }
                    },
                    assistantQueueDoneSizes: {
                        $map: {
                            input: { $objectToArray: { $ifNull: ["$callQueueDone", {}] } },
                            as: "entry",
                            in: {
                                k: "$$entry.k",
                                v: { $size: { $ifNull: ["$$entry.v", []] } }
                            }
                        }
                    },
                    assistantFailedCount: {
                        $map: {
                            input: { $objectToArray: { $ifNull: ["$callQueueDone", {}] } },
                            as: "entry",
                            in: {
                                k: "$$entry.k",
                                v: {
                                    $size: {
                                        $filter: {
                                            input: "$$entry.v",
                                            as: "call",
                                            cond: { $eq: ["$$call.status", "failed_to_initiate"] }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    assistantInitiatedCount: {
                        $map: {
                            input: { $objectToArray: { $ifNull: ["$callQueueDone", {}] } },
                            as: "entry",
                            in: {
                                k: "$$entry.k",
                                v: {
                                    $size: {
                                        $filter: {
                                            input: "$$entry.v",
                                            as: "call",
                                            cond: { $eq: ["$$call.status", "initiated"] }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    callQueueLength: { $size: "$callQueueArray" },
                    callQueueDoneLength: { $size: "$callQueueDoneArray" },
                    callQueueFailed: {
                        $size: {
                            $filter: {
                                input: "$callQueueDoneArray",
                                as: "call",
                                cond: { $eq: ["$$call.status", "failed_to_initiate"] }
                            }
                        }
                    },
                    initiatedCalls: {
                        $size: {
                            $filter: {
                                input: "$callQueueDoneArray",
                                as: "call",
                                cond: { $eq: ["$$call.status", "initiated"] }
                            }
                        }
                    },
                    fullCallDataLength: { $size: "$fullCallData" },
                    shortCalls: {
                        $size: {
                            $filter: {
                                input: "$fullCallData",
                                as: "call",
                                cond: { $lt: [{ $ifNull: ["$$call.durationSeconds", 0] }, 30] }
                            }
                        }
                    },
                    longCalls: {
                        $size: {
                            $filter: {
                                input: "$fullCallData",
                                as: "call",
                                cond: { $gt: [{ $ifNull: ["$$call.durationSeconds", 0] }, 30] }
                            }
                        }
                    },
                    successfulAnalysisCount: {
                        $size: {
                            $filter: {
                                input: "$fullCallData",
                                as: "call",
                                cond: {
                                    $and: [
                                        { $eq: ["$$call.analysis.successEvaluation", "true"] }
                                    ]
                                }
                            }
                        }
                    },
                    successfulAnalysisWithoutVoicemailCount: {
                        $size: {
                            $filter: {
                                input: "$fullCallData",
                                as: "call",
                                cond: {
                                    $and: [
                                        { $eq: ["$$call.analysis.successEvaluation", "true"] },
                                        { $ne: ["$$call.endedReason", "voicemail"] }
                                    ]
                                }
                            }
                        }
                    },
                    assistantSpecificQueue: { $arrayToObject: "$assistantQueueSizes" },
                    assistantSpecificQueueDone: { $arrayToObject: "$assistantQueueDoneSizes" },
                    assistantSpecificFailed: { $arrayToObject: "$assistantFailedCount" },
                    assistantSpecificInitiated: { $arrayToObject: "$assistantInitiatedCount" }
                }
            },
            {
                $project: {
                    queueStats: {
                        totalInQueue: "$callQueueLength",
                        totalInitiated: "$callQueueDoneLength",
                        totalFailed: "$callQueueFailed",
                        totalCompleted: "$initiatedCalls",
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
                        },
                        assistantSpecific: {
                            queue: "$assistantSpecificQueue",
                            initiated: "$assistantSpecificQueueDone",
                            failed: "$assistantSpecificFailed",
                            completed: "$assistantSpecificInitiated",
                        }
                    },
                    callDataStats: {
                        totalCallRecords: "$fullCallDataLength",
                        shortCallsCount: "$shortCalls",
                        longCallsCount: "$longCalls",
                        successfulAnalysisCount: "$successfulAnalysisCount",
                        successfulAnalysisWithoutVoicemailCount: "$successfulAnalysisWithoutVoicemailCount"
                    }
                }
            }
        ]);

        const userData = aggregateResult[0] || {
            queueStats: {
                totalInQueue: 0,
                totalCompleted: 0,
                totalFailed: 0,
                totalInitiated: 0,
                successRate: 0,
                assistantSpecific: {}
            },
            callDataStats: {
                totalCallRecords: 0,
                shortCallsCount: 0,
                longCallsCount: 0,
                successfulAnalysisCount: 0
            }
        };

        return NextResponse.json({ data: userData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
