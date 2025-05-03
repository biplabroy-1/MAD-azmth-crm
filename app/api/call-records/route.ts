import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch call records');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching call records:', error);
    return NextResponse.json({ message: 'Failed to fetch call records' }, { status: 500 });
  }
}