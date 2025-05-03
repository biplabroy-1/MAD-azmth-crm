import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { contacts } = await request.json();

    const response = await axios.post('https://api.vapi.ai/call', {
      assistantId: process.env.VAPI_ASSISTANT_ID,
      phoneNumber: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      },
      customers: contacts,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("API Response:", response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating calls:', error);
    return NextResponse.json({ error: 'Failed to create calls' }, { status: 500 });
  }
}
