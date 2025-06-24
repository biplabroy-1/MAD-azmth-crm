// filepath: app/api/analytics/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/modals/User';
import { CallQueue } from '@/modals/callQueue';
import { CallQueueDone } from '@/modals/callQueueDone';
import CallData from '@/modals/callData.model';
import { currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
        const user = await currentUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userDoc = await User.findOne({ clerkId: user.id });
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = userDoc._id;

    // Count total in queue (pending calls)
    const totalInQueue = await CallQueue.countDocuments({ userId, status: 'pending' });

    // Count completed and failed from CallQueueDone
    const totalInitiated = await CallQueueDone.countDocuments({ userId });
    const totalFailed = await CallQueueDone.countDocuments({ userId, status: 'failed' });
    const totalCompleted = await CallQueueDone.countDocuments({ userId, status: 'initiated' });

    const assistantGroupStats = await CallQueueDone.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { agentId: '$agentId', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Organize assistant-specific stats
    const assistantStats: Record<string, any> = {};
    assistantGroupStats.forEach(({ _id, count }) => {
      const { agentId, status } = _id;
      if (!assistantStats[agentId]) {
        assistantStats[agentId] = {
          initiated: 0,
          failed: 0,
          completed: 0
        };
      }
      if (status === 'initiated') assistantStats[agentId].completed = count;
      if (status === 'failed') assistantStats[agentId].failed = count;
      assistantStats[agentId].initiated += count;
    });

    // CallData analysis
    const fullCallData = await CallData.find({ userId });
    const shortCalls = fullCallData.filter(c => (c.durationSeconds ?? 0) < 30).length;
    const longCalls = fullCallData.filter(c => (c.durationSeconds ?? 0) >= 30).length;
    const successfulAnalysisCount = fullCallData.filter(
      c => c.analysis?.successEvaluation === 'true'
    ).length;

    const successfulAnalysisWithoutVoicemailCount = fullCallData.filter(
      c => c.analysis?.successEvaluation === 'true' && c.endedReason !== 'voicemail'
    ).length;

    const totalCallRecords = fullCallData.length;

    const successRate =
      totalInitiated === 0
        ? 0
        : (((totalInitiated - totalFailed) / totalInitiated) * 100).toFixed(2);

    return NextResponse.json(
      {
        data: {
          queueStats: {
            totalInQueue,
            totalInitiated,
            totalFailed,
            totalCompleted,
            successRate: Number(successRate),
            assistantSpecific: assistantStats
          },
          callDataStats: {
            totalCallRecords,
            shortCallsCount: shortCalls,
            longCallsCount: longCalls,
            successfulAnalysisCount,
            successfulAnalysisWithoutVoicemailCount
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
