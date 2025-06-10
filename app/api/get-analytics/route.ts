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

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const successOnly = searchParams.get('successOnly') === 'true';
        const excludeVoicemail = searchParams.get('excludeVoicemail') === 'true';
        const minDuration = parseInt(searchParams.get('minDuration') || '0');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build conditions array dynamically
        const conditions = [];
        
        if (successOnly) {
            conditions.push({ $eq: ["$$call.analysis.successEvaluation", "true"] });
        }
        
        if (excludeVoicemail) {
            conditions.push({ $ne: ["$$call.endedReason", "voicemail"] });
        }
        
        if (minDuration > 0) {
            conditions.push({ $gt: ["$$call.durationSeconds", minDuration] });
        }
        
        if (startDate) {
            conditions.push({ $gte: ["$$call.startedAt", new Date(startDate)] });
        }
        
        if (endDate) {
            conditions.push({ $lte: ["$$call.startedAt", new Date(endDate)] });
        }

        // Use default condition if none provided
        const filterCondition = conditions.length > 0 
            ? { $and: conditions } 
            : { $expr: true }; // Match all if no conditions

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
                            cond: filterCondition
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