import { Suspense } from "react";
import Loading from "./loading";
import ScheduleLoader from "./schedule-loader";

export default function Page() {
  const today = new Date();
  const selectedDate = today.toISOString().split("T")[0];

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Current date: {selectedDate}
          </p>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <ScheduleLoader />
      </Suspense>
    </main>
  );
}
