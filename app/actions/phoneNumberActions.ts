"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/connectDB";
import PhoneNumberModel from "@/modals/PhoneNumber";
import {
    createVapiPhoneNumber,
    updateVapiPhoneNumber,
    deleteVapiPhoneNumber,
    getPhoneNumbers,
} from "@/lib/vapiHelper";
import { revalidatePath } from "next/cache";

// ✅ CREATE Phone Number
export async function createPhoneNumber({
    assistantId,
    name,
    number,
    twilioAccountSid,
    twilioAuthToken,
}: {
    assistantId: string;
    name: string;
    number: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const vapiResponse = await createVapiPhoneNumber(
            assistantId,
            name,
            number,
            twilioAccountSid,
            twilioAuthToken
        );

        if (!vapiResponse || "error" in vapiResponse) {
            const err = vapiResponse?.error as any;
            const errorMessage =
                err?.body?.message?.join?.(", ") || "Failed to create phone number in Vapi";
            console.error("Vapi error:", err);
            return { success: false, error: errorMessage };
        }

        await connectDB();
        const phoneNumber = new PhoneNumberModel({
            _id: vapiResponse.id,
            ...vapiResponse,
            userId,
        });
        await phoneNumber.save();

        revalidatePath("/dashboard/numbers");

        return { success: true, phoneNumber: JSON.parse(JSON.stringify(phoneNumber)) };
    } catch (error) {
        console.error("Error creating phone number:", error);
        return { success: false, error };
    }
}

// ✅ UPDATE Phone Number
export async function updatePhoneNumber(
    phoneNumberId: string,
    data: any
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const vapiResponse = await updateVapiPhoneNumber(phoneNumberId, data);

        if (!vapiResponse || "error" in vapiResponse) {
            const errorMessage = typeof vapiResponse?.error === 'string' ? vapiResponse.error : "Failed to create phone number in Vapi";
            throw new Error(errorMessage);
        }

        await connectDB();
        await PhoneNumberModel.findOneAndUpdate(
            { _id: phoneNumberId, userId },
            { ...vapiResponse },
            { new: true }
        );

        revalidatePath("/dashboard/numbers");

        return { success: true, phoneNumber: JSON.parse(JSON.stringify(vapiResponse)) };
    } catch (error) {
        console.error("Error updating phone number:", error);
        return { success: false, error: "Failed to update phone number" };
    }
}

// ✅ DELETE Phone Number
export async function deletePhoneNumber(phoneNumberId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await deleteVapiPhoneNumber(phoneNumberId);

        await connectDB();
        await PhoneNumberModel.findOneAndDelete({ _id: phoneNumberId, userId });

        revalidatePath("/dashboard/numbers");

        return { success: true };
    } catch (error) {
        console.error("Error deleting phone number:", error);
        return { success: false, error: "Failed to delete phone number" };
    }
}

// ✅ GET Phone Numbers (from MongoDB)
export async function getPhoneNumbersList() {
    return await getPhoneNumbers();
}
