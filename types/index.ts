import { z } from "zod"

export const CallDataSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    insights: z.object({
        intent: z.enum(["buy", "not_buy", "undecided"])
            .describe("Did the customer show intent to buy?"),

        main_reason: z.string().max(200)
            .describe("The main reason for buying, or the main objection if not buying."),

        positive_triggers: z.array(z.string())
            .describe("Key things they liked or responded positively to."),

        negative_triggers: z.array(z.string())
            .describe("Key problems or objections they raised."),

        customer_context: z.object({
            profession: z.string().optional()
                .describe("Job/profession if clearly mentioned."),
            industry: z.string().optional()
                .describe("Industry or business domain if mentioned."),
            role: z.string().optional()
                .describe("Role in company if mentioned (e.g., owner, manager)."),
            personal_notes: z.array(z.string()).optional()
                .describe("Random personal context explicitly mentioned, e.g., hobbies, likes, casual interests or any other things.")
        }).optional()
    }),
    timestamp: z.number(),
    type: z.string(),
    analysis: z.object({ summary: z.string(), successEvaluation: z.string() }),
    artifact: z.object({
        messages: z.array(
            z.union([
                z.object({
                    role: z.string(),
                    message: z.string(),
                    time: z.number(),
                    secondsFromStart: z.number()
                }),
                z.object({
                    role: z.string(),
                    message: z.string(),
                    time: z.number(),
                    endTime: z.number(),
                    secondsFromStart: z.number(),
                    duration: z.number(),
                    source: z.string()
                }),
                z.object({
                    role: z.string(),
                    message: z.string(),
                    time: z.number(),
                    endTime: z.number(),
                    secondsFromStart: z.number(),
                    duration: z.number()
                })
            ])
        ),
        messagesOpenAIFormatted: z.array(
            z.object({ role: z.string(), content: z.string() })
        ),
        transcript: z.string(),
        recordingUrl: z.string(),
        stereoRecordingUrl: z.string(),
        logUrl: z.string(),
        recording: z.object({
            stereoUrl: z.string(),
            mono: z.object({
                combinedUrl: z.string(),
                assistantUrl: z.string(),
                customerUrl: z.string()
            })
        }),
        nodes: z.array(z.unknown()),
        variables: z.object({
            now: z.string(),
            date: z.string(),
            time: z.string(),
            year: z.string(),
            month: z.string(),
            day: z.string(),
            customer: z.object({ number: z.string(), name: z.string() }),
            phoneNumber: z.object({
                provider: z.string(),
                number: z.string(),
                twilioAccountSid: z.string(),
                twilioAuthToken: z.string()
            })
        }),
        variableValues: z.object({
            now: z.string(),
            date: z.string(),
            time: z.string(),
            year: z.string(),
            month: z.string(),
            day: z.string(),
            customer: z.object({ number: z.string(), name: z.string() }),
            phoneNumber: z.object({
                provider: z.string(),
                number: z.string(),
                twilioAccountSid: z.string(),
                twilioAuthToken: z.string()
            })
        }),
        performanceMetrics: z.object({
            turnLatencies: z.array(
                z.object({
                    modelLatency: z.number(),
                    voiceLatency: z.number(),
                    transcriberLatency: z.number(),
                    endpointingLatency: z.number(),
                    turnLatency: z.number()
                })
            ),
            modelLatencyAverage: z.number(),
            voiceLatencyAverage: z.number(),
            transcriberLatencyAverage: z.number(),
            endpointingLatencyAverage: z.number(),
            turnLatencyAverage: z.number()
        })
    }),
    startedAt: z.string(),
    endedAt: z.string(),
    endedReason: z.string(),
    cost: z.number(),
    costBreakdown: z.object({
        stt: z.number(),
        llm: z.number(),
        tts: z.number(),
        vapi: z.number(),
        chat: z.number(),
        transport: z.number(),
        total: z.number(),
        llmPromptTokens: z.number(),
        llmCompletionTokens: z.number(),
        ttsCharacters: z.number(),
        voicemailDetectionCost: z.number(),
        knowledgeBaseCost: z.number(),
        analysisCostBreakdown: z.object({
            summary: z.number(),
            summaryPromptTokens: z.number(),
            summaryCompletionTokens: z.number(),
            structuredData: z.number(),
            structuredDataPromptTokens: z.number(),
            structuredDataCompletionTokens: z.number(),
            successEvaluation: z.number(),
            successEvaluationPromptTokens: z.number(),
            successEvaluationCompletionTokens: z.number(),
            structuredOutput: z.number(),
            structuredOutputPromptTokens: z.number(),
            structuredOutputCompletionTokens: z.number()
        })
    }),
    costs: z.array(
        z.union([
            z.object({
                type: z.string(),
                transcriber: z.object({ provider: z.string(), model: z.string() }),
                minutes: z.number(),
                cost: z.number()
            }),
            z.object({
                type: z.string(),
                model: z.object({ provider: z.string(), model: z.string() }),
                promptTokens: z.number(),
                completionTokens: z.number(),
                cost: z.number()
            }),
            z.object({
                type: z.string(),
                voice: z.object({
                    provider: z.string(),
                    voiceId: z.string(),
                    model: z.string()
                }),
                characters: z.number(),
                cost: z.number()
            }),
            z.object({
                type: z.string(),
                subType: z.string(),
                minutes: z.number(),
                cost: z.number()
            }),
            z.object({
                type: z.string(),
                analysisType: z.string(),
                model: z.object({ provider: z.string(), model: z.string() }),
                promptTokens: z.number(),
                completionTokens: z.number(),
                cost: z.number()
            }),
            z.object({
                type: z.string(),
                model: z.object({ provider: z.string(), model: z.string() }),
                provider: z.string(),
                promptTextTokens: z.number(),
                promptAudioTokens: z.number(),
                completionTextTokens: z.number(),
                completionAudioTokens: z.number(),
                cost: z.number()
            })
        ])
    ),
    durationMs: z.number(),
    durationSeconds: z.number(),
    durationMinutes: z.number(),
    summary: z.string(),
    transcript: z.string(),
    messages: z.array(
        z.union([
            z.object({
                role: z.string(),
                message: z.string(),
                time: z.number(),
                secondsFromStart: z.number()
            }),
            z.object({
                role: z.string(),
                message: z.string(),
                time: z.number(),
                endTime: z.number(),
                secondsFromStart: z.number(),
                duration: z.number(),
                source: z.string()
            }),
            z.object({
                role: z.string(),
                message: z.string(),
                time: z.number(),
                endTime: z.number(),
                secondsFromStart: z.number(),
                duration: z.number()
            })
        ])
    ),
    recordingUrl: z.string(),
    stereoRecordingUrl: z.string(),
    call: z.object({
        id: z.string(),
        orgId: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        type: z.string(),
        cost: z.number(),
        monitor: z.object({ listenUrl: z.string(), controlUrl: z.string() }),
        transport: z.object({
            provider: z.string(),
            callSid: z.string(),
            accountSid: z.string()
        }),
        phoneCallProvider: z.string(),
        phoneCallProviderId: z.string(),
        phoneCallTransport: z.string(),
        status: z.string(),
        assistantId: z.string(),
        phoneNumber: z.object({
            twilioAuthToken: z.string(),
            twilioAccountSid: z.string(),
            twilioPhoneNumber: z.string()
        }),
        customer: z.object({ name: z.string(), number: z.string() })
    }),
    phoneNumber: z.object({
        provider: z.string(),
        number: z.string(),
        twilioAccountSid: z.string()
    }),
    customer: z.object({ number: z.string(), name: z.string() }),
    assistant: z.object({
        id: z.string(),
        orgId: z.string(),
        name: z.string(),
        voice: z.object({ voiceId: z.string(), provider: z.string() }),
        createdAt: z.string(),
        updatedAt: z.string(),
        model: z.object({
            model: z.string(),
            messages: z.array(z.object({ role: z.string(), content: z.string() })),
            provider: z.string(),
            temperature: z.number()
        }),
        firstMessage: z.string(),
        voicemailMessage: z.string(),
        endCallFunctionEnabled: z.boolean(),
        endCallMessage: z.string(),
        transcriber: z.object({
            model: z.string(),
            language: z.string(),
            numerals: z.boolean(),
            provider: z.string(),
            endpointing: z.number(),
            confidenceThreshold: z.number()
        }),
        silenceTimeoutSeconds: z.number(),
        clientMessages: z.array(z.string()),
        serverMessages: z.array(z.string()),
        dialKeypadFunctionEnabled: z.boolean(),
        hipaaEnabled: z.boolean(),
        maxDurationSeconds: z.number(),
        backchannelingEnabled: z.boolean(),
        voicemailDetection: z.object({
            provider: z.string(),
            backoffPlan: z.object({
                maxRetries: z.number(),
                startAtSeconds: z.number(),
                frequencySeconds: z.number()
            }),
            beepMaxAwaitSeconds: z.number(),
            voicemailExpectedDurationSeconds: z.number()
        }),
        backgroundDenoisingEnabled: z.boolean(),
        startSpeakingPlan: z.object({
            waitSeconds: z.number(),
            smartEndpointingPlan: z.object({ provider: z.string() }),
            smartEndpointingEnabled: z.string()
        }),
        stopSpeakingPlan: z.object({ numWords: z.number() }),
        server: z.object({ url: z.string(), timeoutSeconds: z.number() })
    }),
})


export type CallData = z.infer<typeof CallDataSchema>;