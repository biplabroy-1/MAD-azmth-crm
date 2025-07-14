import { auth } from "@clerk/nextjs/server";
import ScheduleForm from "@/components/scheduleForm";
import { getAssistents } from "@/lib/utils";
import { fetchUserSchedule } from "@/lib/dataAccessLayer";

export default async function SchedulePage() {
  const { userId } = await auth();

  if (!userId) return <div>Please log in.</div>;

  const assistantsData = await getAssistents();

  const assistants = Array.isArray(assistantsData) ? assistantsData : [];

  const schedule = await fetchUserSchedule(userId);
  const today = new Date();
  const selectedDate = today.toISOString().split("T")[0];

  if (!schedule) {
    <div>Please log in.</div>;
  }

  return (
    <main className="p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">
          Set Weekly Assistant Schedule (EDT)
        </h1>
        <h1 className="text-lg font-bold mb-4">Date: {selectedDate}</h1>
      </div>
      <ScheduleForm assistants={assistants} initialSchedule={schedule} />
    </main>
  );
}
