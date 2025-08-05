import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User, { IUser } from '@/modals/User';
import { CallQueue } from '@/modals/callQueue';
import { CallQueueDone } from '@/modals/callQueueDone';
import CallData from '@/modals/callData.model';
import { currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const clerkId = user?.id;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const cacheKey = `overview:${clerkId}`;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, { status: 200 });
    }

    await connectDB();

    const userDoc = await User.findOne({ clerkId }).select("clerkId").lean() as IUser | null;

    if (!userDoc)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = userDoc.clerkId;

    const [
      totalInQueue,
      totalInitiated,
      totalFailed,
      totalCompleted,
      assistantGroupStats,
      callDataAggregation
    ] = await Promise.all([
      CallQueue.countDocuments({ userId, status: 'pending' }),
      CallQueueDone.countDocuments({ userId }),
      CallQueueDone.countDocuments({ userId, status: 'failed' }),
      CallQueueDone.countDocuments({ userId, status: 'initiated' }),
      CallQueueDone.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: { agentId: '$agentId', status: '$status' },
            count: { $sum: 1 }
          }
        }
      ]),
      CallData.aggregate([
        { $match: { userId } },
        {
          $facet: {
            shortCalls: [
              { $match: { durationSeconds: { $lt: 30 } } },
              { $count: 'count' }
            ],
            longCalls: [
              { $match: { durationSeconds: { $gte: 30 } } },
              { $count: 'count' }
            ],
            successfulAnalysis: [
              { $match: { 'analysis.successEvaluation': 'true' } },
              { $count: 'count' }
            ],
            successfulWithoutVoicemail: [
              {
                $match: {
                  'analysis.successEvaluation': 'true',
                  endedReason: { $ne: 'voicemail' }
                }
              },
              { $count: 'count' }
            ],
            totalCalls: [{ $count: 'count' }]
          }
        }
      ])
    ]);
    // Organize assistant-specific stats
    const assistantStats: Record<string, {
      queued: number;
      initiated: number;
      failed: number;
      completed: number;
    }> = {};

    // Get queued calls per assistant from CallQueue
    const queuedByAssistant = await CallQueue.aggregate([
      { $match: { userId, status: 'pending' } },
      {
        $group: {
          _id: '$agentId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize assistantStats with queued counts
    queuedByAssistant.forEach(({ _id, count }) => {
      if (!assistantStats[_id]) {
        assistantStats[_id] = {
          queued: 0,
          initiated: 0,
          failed: 0,
          completed: 0
        };
      }
      assistantStats[_id].queued = count;
    });

    assistantGroupStats.forEach(({ _id, count }) => {
      const { agentId, status } = _id;
      if (!assistantStats[agentId]) {
        assistantStats[agentId] = {
          queued: 0,
          initiated: 0,
          failed: 0,
          completed: 0
        };
      }
      if (status === 'initiated') assistantStats[agentId].completed = count;
      if (status === 'failed') assistantStats[agentId].failed = count;
      assistantStats[agentId].initiated += count;
    });

    const callDataStats = {
      totalCallRecords: callDataAggregation[0]?.totalCalls[0]?.count || 0,
      shortCallsCount: callDataAggregation[0]?.shortCalls[0]?.count || 0,
      longCallsCount: callDataAggregation[0]?.longCalls[0]?.count || 0,
      successfulAnalysisCount: callDataAggregation[0]?.successfulAnalysis[0]?.count || 0,
      successfulAnalysisWithoutVoicemailCount: callDataAggregation[0]?.successfulWithoutVoicemail[0]?.count || 0
    };

    const successRate = totalInitiated === 0
      ? 0
      : Number(((totalInitiated - totalFailed) / totalInitiated * 100).toFixed(2));

    const responseData = {
      data: {
        queueStats: {
          totalInQueue,
          totalInitiated,
          totalFailed,
          totalCompleted,
          successRate,
          assistantSpecific: assistantStats
        },
        callDataStats
      }
    };

    await redis.setex(cacheKey, 180, JSON.stringify(responseData));

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
