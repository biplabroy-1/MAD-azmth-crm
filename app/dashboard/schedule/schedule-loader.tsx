// app/(dashboard)/schedule/schedule-loader.tsx
import { getAssistents } from "@/lib/vapiHelper";
import { getSchedule } from "@/app/actions/scheduleActions";
import { Suspense } from "react";
import Loading from "./loading";
import ScheduleForm from "./scheduleForm";
import type { Schedule } from "@/types/interfaces";

export default async function ScheduleLoader() {
  const assistants = await getAssistents();
  const schedule = await getSchedule();

  return (
    <Suspense fallback={<Loading />}>
      {assistants && schedule ? (
        <ScheduleForm
          assistants={assistants}
          initialSchedule={schedule as Schedule}
        />
      ) : null}
    </Suspense>
  );
}
