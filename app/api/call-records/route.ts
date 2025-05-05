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

// import { NextRequest, NextResponse } from 'next/server';
// import mongoose, { Schema, Document, connect } from 'mongoose';

// const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

// interface CallMetadata {
//   callDate: Date;
//   phoneNumber: string;
//   duration: number;
//   status: string;
//   [key: string]: any;
// }

// interface CallTranscript extends Document {
//   callId: string;
//   transcript: string;
//   metadata: CallMetadata;
//   createdAt: Date;
// }

// const CallTranscriptSchema = new Schema<CallTranscript>({
//   callId: { type: String, required: true, index: true },
//   transcript: { type: String, required: true },
//   metadata: {
//     callDate: { type: Date, default: Date.now },
//     phoneNumber: { type: String, default: '' },
//     duration: { type: Number, default: 0 },
//     status: { type: String, default: 'unknown' },
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// let CallTranscriptModel: mongoose.Model<CallTranscript>;

// try {
//   CallTranscriptModel = mongoose.model<CallTranscript>('CallTranscript');
// } catch {

//   CallTranscriptModel = mongoose.model<CallTranscript>('CallTranscript', CallTranscriptSchema);
// }

// async function connectToDatabase() {
//   if (!MONGODB_URI) {
//     throw new Error('Please define the  environment variable');
//   }
  
//   if (mongoose.connection.readyState !== 1) {
//     await mongoose.connect(MONGODB_URI);
//     console.log('Connected to MongoDB with Mongoose');
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     await connectToDatabase();
    
//     const vapiResponse = await fetch('https://api.vapi.ai/call', {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
//       },
//     });

//     if (!vapiResponse.ok) {
//       throw new Error(`Failed to fetch call records: ${vapiResponse.statusText}`);
//     }

//     const callData = await vapiResponse.json();
    
//     const processedCalls = [];
    
//     for (const call of callData.calls || []) {
      
//       if (call.id) {
//         const transcriptResponse = await fetch(`https://api.vapi.ai/call/${call.id}/transcript`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
//           },
//         });
        
//         if (transcriptResponse.ok) {
//           const transcriptData = await transcriptResponse.json();
          
//           const callTranscriptDoc = new CallTranscriptModel({
//             callId: call.id,
//             transcript: transcriptData.transcript || '',
//             metadata: {
//               callDate: call.created_at || new Date(),
//               phoneNumber: call.phone_number || '',
//               duration: call.duration || 0,
//               status: call.status || '',
//             },
//             createdAt: new Date()
//           });
        
//           await callTranscriptDoc.save();
          
//           processedCalls.push({
//             callId: call.id,
//             saved: true,
//             mongoId: callTranscriptDoc._id
//           });
//         } else {
//           processedCalls.push({
//             callId: call.id,
//             saved: false,
//             error: 'Failed to fetch transcript'
//           });
//         }
//       }
//     }
    
//     return NextResponse.json({
//       success: true,
//       message: 'Call transcripts processed',
//       processedCalls
//     });
    
//   } catch (error) {
//     console.error('Error processing call transcripts:', error);
//     return NextResponse.json(
//       { 
//         message: 'Failed to process call transcripts', 
//         error: error instanceof Error ? error.message : 'Unknown error' 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const requestData = await request.json();
//     const callId = requestData.callId;
    
//     if (!callId) {
//       return NextResponse.json(
//         { message: 'Call ID is required' },
//         { status: 400 }
//       );
//     }
    

//     const transcriptResponse = await fetch(`https://api.vapi.ai/call/${callId}/transcript`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
//       },
//     });
    
//     if (!transcriptResponse.ok) {
//       throw new Error(`Failed to fetch transcript: ${transcriptResponse.statusText}`);
//     }
    
//     const transcriptData = await transcriptResponse.json();
    
//     await connectToDatabase();
    
//     const callTranscriptDoc = new CallTranscriptModel({
//       callId,
//       transcript: transcriptData.transcript || '',
//       metadata: requestData.metadata || {},
//       createdAt: new Date()
//     });
    
//     await callTranscriptDoc.save();
    
//     return NextResponse.json({
//       success: true,
//       message: 'Call transcript saved successfully',
//       mongoId: callTranscriptDoc._id
//     });
    
//   } catch (error) {
//     console.error('Error saving call transcript:', error);
//     return NextResponse.json(
//       { 
//         message: 'Failed to save call transcript', 
//         error: error instanceof Error ? error.message : 'Unknown error' 
//       },
//       { status: 500 }
//     );
//   }
// }