"use client";

import { getAssistents } from "@/lib/vapiHelper";
import { getSchedule } from "@/app/actions/scheduleActions";
import ScheduleForm from "@/app/(dashboard)/schedule/scheduleForm";
import type { Schedule } from "@/types/interfaces";

export async function ScheduleLoader() {
  const [assistantsData, scheduleData] = await Promise.all([
    getAssistents(),
    getSchedule(),
  ]);

  const assistants = Array.isArray(assistantsData) ? assistantsData : [];
  const schedule = scheduleData ?? {};

  return (
    <ScheduleForm
      assistants={assistants}
      initialSchedule={schedule as Schedule}
    />
  );
}
