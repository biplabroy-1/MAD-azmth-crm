"use server";

import connectDB from "@/lib/connectDB";
import { auth, clerkClient } from "@clerk/nextjs/server";
import User from "@/modals/User";
import { createAssistant } from "@/app/actions/assistantActions"; // ✅ Use the action version

export const completeOnboarding = async (formData: FormData) => {
    const systemPrompt = formData.get("systemPrompt");
    const firstMessage = formData.get("firstMessage");
    const endCallMessage = formData.get("endCallMessage");

    if (!systemPrompt || !firstMessage || !endCallMessage) {
        return { message: "All form fields are required." };
    }

    const { userId } = await auth();
    if (!userId) {
        return { message: "User not authenticated. Please log in." };
    }

    try {
        await connectDB();
        const client = await clerkClient();

        const userFromClerk = await client.users.getUser(userId);

        const isGoogleLogin = userFromClerk.externalAccounts?.some(
            (account) => account.provider === "oauth_google"
        );

        const firstName = isGoogleLogin
            ? userFromClerk.firstName
            : (userFromClerk.unsafeMetadata?.firstName as string);
        const lastName = isGoogleLogin
            ? userFromClerk.lastName
            : (userFromClerk.unsafeMetadata?.lastName as string);

        if (!firstName) {
            return { message: "First name is missing. Please update your profile." };
        }

        // ✅ Reuse the existing createAssistant action
        const assistantResult = await createAssistant(
            firstName,
            systemPrompt as string,
            firstMessage as string,
            endCallMessage as string
        );

        if (!assistantResult.success) {
            return { message: assistantResult.error || "Could not create assistant" };
        }

        const assistant = assistantResult.assistant;

        // ✅ Upsert the user into DB
        await User.findOneAndUpdate(
            { clerkId: userId },
            {
                $set: {
                    _id: userId,
                    clerkId: userId,
                    email: userFromClerk.emailAddresses[0].emailAddress,
                    firstName,
                    lastName,
                    profileImageUrl: userFromClerk.imageUrl,
                },
            },
            { upsert: true, new: true }
        );

        // Assistant already saved in DB inside createAssistant

        // ✅ Update Clerk metadata
        await client.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true,
            },
            privateMetadata: {
                ...userFromClerk.privateMetadata,
                callCount: 0,
            },
        });

        return {
            message: "Onboarding completed successfully!",
            assistantId: assistant.id,
        };
    } catch (e) {
        console.error("Error during onboarding:", e);
        return {
            message: "An unexpected error occurred. Please try again later.",
        };
    }
};
