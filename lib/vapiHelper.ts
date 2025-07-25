import { VapiClient } from "@vapi-ai/server-sdk";

const client = new VapiClient({ token: process.env.VAPI_API_KEY! });

export async function getAllCalls(limit: number, assistantId?: string) {
    try {
        const response = await client.calls.list({
            limit,
            assistantId,
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function getAssistents(limit?: number) {
    try {
        const response = await client.assistants.list({
            limit,
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function createAssistant(name: string) {
    const defaultConfig = {
        server: {
            url: process.env.BACKEND_URL!,
            timeoutSeconds: 60
        },
    }
    try {
        const response = await client.assistants.create({
            name,
            ...defaultConfig,
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}

export async function createPhoneNumber(assistantId: string, name: string, number: string, twilioAccountSid: string, twilioAuthToken: string) {
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
        console.log(error);
    }
}
