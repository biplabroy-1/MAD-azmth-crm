import connectDB from "@/lib/connectDB";
import User from "@/modals/User";
import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const users = await User.aggregate([
            {
                $match: {
                    _id: user.id
                }
            },
            {
                $project: {
                    matchingCalls: {
                        $filter: {
                            input: "$fullCallData",
                            as: "call",
                            cond: {
                                $and: [
                                    { $eq: ["$$call.analysis.successEvaluation", "true"] },
                                    { $ne: ["$$call.endedReason", "voicemail"] },
                                    { $gt: ["$$call.durationSeconds", 30] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    matchingCalls: {
                        $map: {
                            input: "$matchingCalls",
                            as: "call",
                            in: {
                                analysis: "$$call.analysis",
                                startedAt: "$$call.startedAt",
                                endedReason: "$$call.endedReason",
                                durationSeconds: "$$call.durationSeconds",
                                transcript: "$$call.transcript",
                                recordingUrl: "$$call.recordingUrl",
                                call: {
                                    id: "$$call.call.id",
                                    type: "$$call.call.type",
                                    phoneNumber: "$$call.call.phoneNumber.twilioPhoneNumber",
                                },
                                customer: "$$call.customer",
                                assistant: {
                                    id: "$$call.assistant.id",
                                    name: "$$call.assistant.name"
                                }
                            }
                        }
                    }
                }
            }
        ]);
        
        return NextResponse.json({ data: users }, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/get-analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics data" },
            { status: 500 }
        );
    }
}