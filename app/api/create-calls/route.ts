import { type NextRequest, NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

const E164_REGEX = /^\+[1-9]\d{1,14}$/; // E.164 phone format
const MAX_NAME_LENGTH = 10;
const ALLOWED_CONTACT_KEYS = new Set(['name', 'number']);

function isValidPhone(number: unknown): number is string {
  return typeof number === 'string' && E164_REGEX.test(number);
}

function isValidName(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH;
}

function validateContact(contact: unknown) {
  if (typeof contact !== 'object' || contact === null) {
    throw new Error('Contact must be an object');
  }
  const keys = Object.keys(contact);
  if (keys.length === 0) {
    throw new Error('Contact object cannot be empty');
  }
  for (const key of keys) {
    if (!ALLOWED_CONTACT_KEYS.has(key)) {
      throw new Error(`Invalid contact field: ${key}`);
    }
  }

  const c = contact as Record<string, unknown>;

  if (!isValidName(c.name)) {
    throw new Error('Invalid or missing contact name');
  }
  if (!isValidPhone(c.number)) {
    throw new Error('Invalid or missing contact number (must be in E.164 format)');
  }

  return {
    name: (c.name as string).trim(),
    number: (c.number as string).trim(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { contact, assistantId } = await request.json();

    if (!assistantId || typeof assistantId !== 'string') {
      return NextResponse.json({ error: 'No assistantId provided' }, { status: 400 });
    }

    let sanitizedContact;
    try {
      sanitizedContact = validateContact(contact);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    const user = await currentUser();
    const clerkId = user?.id;

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check lifetime call limit using Clerk private metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);
    const callCount = Number(clerkUser.privateMetadata.callCount ?? 0);
    const MAX_CALLS = 3;
    const remainingCalls = MAX_CALLS - callCount;

    if (remainingCalls <= 0) {
      return NextResponse.json({
        error: `Lifetime call limit reached. You have used all ${MAX_CALLS} calls.`,
      }, { status: 403 });
    }

    if (remainingCalls < 1) {
      return NextResponse.json({
        error: `You have ${callCount}/${MAX_CALLS} calls used. No calls remaining.`,
      }, { status: 400 });
    }

    // Make API call to vapi.ai
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
        customer: sanitizedContact,
      }),
    });

    const data = await response.json();

    if (response.ok && data) {
      const newCallCount = callCount + 1;
      await clerk.users.updateUser(clerkId, {
        privateMetadata: {
          ...clerkUser.privateMetadata,
          callCount: newCallCount,
        },
      });
      console.log(`Updated call count for user ${clerkId}: ${callCount} -> ${newCallCount}`);
    } else {
      // If provider rejected, pass the error info
      console.error('VAPI call failed', { status: response.status, body: data });
      return NextResponse.json({
        error: 'Call provider rejected the request',
        providerStatus: response.status,
        providerBody: data,
      }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating calls:', error);
    return NextResponse.json({ error: 'Failed to create calls' }, { status: 500 });
  }
}
