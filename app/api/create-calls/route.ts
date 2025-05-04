import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/connectDB';
import User from '@/modals/User';


export async function POST(request: NextRequest) {
  try {
    const { contacts } = await request.json();
    const user = await currentUser();
    const clerkId = user?.id; // Assuming Clerk middleware adds this header

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
    }

    await connectDB();

    // Assuming you have a User model and you want to fetch the user's Twilio configuration
    const userRecord = await User.findOne({ clerkId });
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { twilioConfig } = userRecord;
    if (!twilioConfig) {
      return NextResponse.json({ error: 'Twilio configuration not found' }, { status: 404 });
    }
    const { sid, authToken, phoneNumber } = twilioConfig;

    const response = await fetch('https://api.vapi.ai/call',{
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: process.env.VAPI_ASSISTANT_ID,
        phoneNumber: {
          twilioAccountSid: sid,
          twilioPhoneNumber: phoneNumber,
          twilioAuthToken: authToken,
        },
        customers: contacts,
      }),
    });
    const data = await response.json();
    console.log("API Response:", data);   
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating calls:', error);
    return NextResponse.json({ error: 'Failed to create calls' }, { status: 500 });
  }
}
