"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { saveScheduleToDB } from "@/lib/dataAccessLayer";
import type { Schedule } from "@/types/interfaces";

export async function saveSchedule(schedule: Schedule) {
    const { userId } = await auth();

    if (!userId) {
        return { status: "error", message: "Not authenticated" };
    }
    console.log(schedule);
    await saveScheduleToDB(userId, schedule);

    revalidatePath("/schedule");
    return { status: "success", message: "Schedule saved!" };
}
