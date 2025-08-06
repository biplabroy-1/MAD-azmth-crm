export const dynamic = "force-dynamic";

import { getAllCalls } from "@/lib/vapiHelper";
import { CallRecordsContent } from "./call-records-content";
import { Suspense } from "react";
import { Loading } from "@/components/utils";

export async function CallRecordsLoader() {
  const callRecords = await getAllCalls(1000);
  if (!callRecords) return null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Call Records
        </h1>
        <p className="text-muted-foreground mt-1">
          {callRecords.length} {callRecords.length === 1 ? "record" : "records"}{" "}
          found
        </p>
      </div>
      <CallRecordsContent initialCallRecords={callRecords} />
    </div>
  );
}
