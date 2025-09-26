import { type NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/connectDB';
import User from '@/modals/User';

export async function POST(request: NextRequest) {
  try {
    const { contacts } = await request.json();
    const user = await currentUser();
    const clerkId = user?.id;

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
    }
    if (contacts.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 contacts allowed per request' }, { status: 400 });
    }

    await connectDB();
    const userRecord = await User.findOne({ clerkId });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check lifetime call limit using Clerk private metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);
    const callCount = (clerkUser.privateMetadata.callCount as number) || 0;
    const remainingCalls = 3 - callCount;

    if (remainingCalls <= 0) {
      return NextResponse.json({
        error: 'Lifetime call limit reached. You have used all 3 calls.'
      }, { status: 403 });
    }

    if (contacts.length > remainingCalls) {
      return NextResponse.json({
        error: `You can only make ${remainingCalls} more call(s). You have ${callCount}/3 calls used.`
      }, { status: 400 });
    }

    const { assistantId } = userRecord;

    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId,
        phoneNumber: {
          twilioAccountSid: process.env.TWILIO_SID,
          twilioPhoneNumber: process.env.TWILIO_PHONE,
          twilioAuthToken: process.env.TWILIO_AUTH,
        },
        customers: contacts,
      }),
    });
    const data = await response.json();
    console.log("API Response:", data);

    // If calls were created successfully, update the user's call count in Clerk
    if (response.ok && data) {
      const newCallCount = callCount + contacts.length;
      await clerk.users.updateUser(clerkId, {
        privateMetadata: {
          ...clerkUser.privateMetadata,
          callCount: newCallCount
        }
      });
      console.log(`Updated call count for user ${clerkId}: ${callCount} -> ${newCallCount}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating calls:', error);
    return NextResponse.json({ error: 'Failed to create calls' }, { status: 500 });
  }
}
