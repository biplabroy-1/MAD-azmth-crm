import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/connectDB';
import { CallQueue } from '@/modals/callQueue';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId } = await auth();
        
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { contactIds, assistantId } = await req.json();

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return new NextResponse('Contact IDs are required', { status: 400 });
        }

        if (!assistantId) {
            return new NextResponse('Assistant ID is required', { status: 400 });
        }

        // Delete the queued contacts that belong to this user and match the contact IDs
        const result = await CallQueue.deleteMany({
            _id: { $in: contactIds },
            userId: userId,
            agentId: assistantId,
            status: 'pending' // Only allow deleting pending calls
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('[DELETE_QUEUED_CONTACTS_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
