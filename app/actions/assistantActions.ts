"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/connectDB";
import AssistantModel from "@/modals/Assistant";
import {
  createVapiAssistant,
  updateVapiAssistant,
  deleteVapiAssistant,
  getAssistants,
} from "@/lib/vapiHelper";
import { revalidatePath } from "next/cache";
import type { Assistant } from "@/types/interfaces";

export async function createAssistant(
  name: string,
  systemPrompt: string,
  firstMessage: string,
  endCallMessage: string,

) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Create assistant in Vapi
    const vapiResponse = await createVapiAssistant(
      name,
      systemPrompt,
      firstMessage,
      endCallMessage
    );

    if ("error" in vapiResponse!) {
      throw new Error(vapiResponse.error);
    }

    // Save to database
    await connectDB();
    const assistant = new AssistantModel({
      _id: vapiResponse.id,
      ...vapiResponse,
      userId,
    });
    await assistant.save();

    revalidatePath("/dashboard/assistents");
    return { success: true, assistant: JSON.parse(JSON.stringify(assistant)) };
  } catch (error) {
    console.error("Error creating assistant:", error);
    return { success: false, error: "Failed to create assistant" };
  }
}

export async function updateAssistant(
  assistantId: string,
  data: Partial<Assistant> | any
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Update in Vapi
    const vapiResponse = await updateVapiAssistant(assistantId, data);

    // Update in database
    await connectDB();
    await AssistantModel.findOneAndUpdate(
      { id: assistantId, userId },
      { ...vapiResponse },
      { new: true }
    );

    revalidatePath("/dashboard/assistents");
    return { success: true, assistant: JSON.parse(JSON.stringify(vapiResponse)) };
  } catch (error) {
    console.error("Error updating assistant:", error);
    return { success: false, error: "Failed to update assistant" };
  }
}

export async function deleteAssistant(assistantId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete from Vapi
    await deleteVapiAssistant(assistantId);

    // Delete from database
    await connectDB();
    await AssistantModel.findOneAndDelete({ id: assistantId, userId });

    revalidatePath("/dashboard/assistents");
    return { success: true };
  } catch (error) {
    console.error("Error deleting assistant:", error);
    return { success: false, error: "Failed to delete assistant" };
  }
}

export async function getAssistantsList(): Promise<{ success: boolean; assistants?: Assistant[]; error?: string }> {
  const assistants = await getAssistants();
  if (!assistants) {
    return { success: false, error: "Failed to fetch assistants" };
  }
  return { success: true, assistants: JSON.parse(JSON.stringify(assistants)) };
}

