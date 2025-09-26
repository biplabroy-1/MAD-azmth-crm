import "server-only"

import { Vapi, VapiClient } from "@vapi-ai/server-sdk";
import connectDB from "./connectDB";
import AssistantModel from "@/modals/Assistant";
import { auth } from "@clerk/nextjs/server";
import PhoneNumberModel from "@/modals/PhoneNumber";
import { Assistant, phoneNumber } from "@/types/interfaces";
const client = new VapiClient({ token: process.env.VAPI_API_KEY! });

// Fetch assistants from DB
export async function getAssistants(): Promise<Assistant[] | undefined> {
    const { userId } = await auth();
    try {
        await connectDB();
        const assistants = await AssistantModel.find({ userId }).lean() as Assistant[] | [];
        return assistants;
    } catch (error) {
        console.error(error);
    }
}

export async function getPhoneNumbers() {
    const { userId } = await auth();
    try {
        await connectDB();
        const phoneNumbers = await PhoneNumberModel.find({ userId }).lean() as phoneNumber[] | [];
        return phoneNumbers;
    } catch (error) {
        console.error(error);
    }
}


export async function createVapiAssistant(name: string, systemPrompt: string, firstMessage: string, endCallMessage: string) {
    const defaultConfig = {
        server: {
            url: `${process.env.BACKEND_URL!}/webhook`,
            timeoutSeconds: 60
        },
    }
    try {
        const response = await client.assistants.create({
            model: {
                provider: "groq",
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    }
                ]
            },
            voice: {
                provider: "deepgram",
                model: "aura-2",
                voiceId: "asteria",
            },
            transcriber: {
                provider: "deepgram",
                model: "nova-3",
                language: "en",
                confidenceThreshold: 0.4,
                numerals: true,
            },
            firstMessage,
            endCallMessage,
            serverMessages: ["conversation-update", "end-of-call-report", "function-call", "hang", "speech-update", "status-update", "tool-calls", "transfer-destination-request", "user-interrupted"],
            clientMessages: ["conversation-update", "function-call", "hang", "model-output", "speech-update", "status-update", "transfer-update", "transcript", "tool-calls", "user-interrupted", "voice-input", "workflow.node.started"],
            name: name || `${name}'s Assistant`,
            ...defaultConfig,
        });
        return response;
    } catch (error) {
        console.error(error);
        return { error: "Error Creating Assistant" }
    }
}

export async function updateVapiAssistant(assistantId: string, data: any) {
    try {
        const response = await client.assistants.update(assistantId, data);
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteVapiAssistant(assistantId: string) {
    try {
        const response = await client.assistants.delete(assistantId);
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function createVapiPhoneNumber(assistantId: string, name: string, number: string, twilioAccountSid: string, twilioAuthToken: string) {
    try {
        const response = await client.phoneNumbers.create({
            assistantId,
            name,
            number,
            provider: "twilio",
            twilioAccountSid,
            twilioAuthToken,
        });
        return response;
    } catch (error) {
        console.error(error);
        return { error }
    }
}

export async function deleteVapiPhoneNumber(phoneNumberId: string) {
    try {
        const response = await client.phoneNumbers.delete(phoneNumberId);
        return response;
    } catch (error) {
        console.error(error);
    }
}

export async function updateVapiPhoneNumber(phoneNumberId: string, data: Vapi.TwilioPhoneNumber) {
    try {
        const response = await client.phoneNumbers.update(phoneNumberId, data);
        return response;
    } catch (error) {
        console.error(error);
    }
}
