import { Suspense } from "react";
import { CallRecordsContent } from "./call-records-content";
import { CallRecordsLoading } from "./call-records-loading";
import { getAllCalls } from "@/lib/vapiHelper";

export default async function CallRecordsPage() {
  const callRecords = await getAllCalls(1000);
  if (!callRecords) return null;
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CallRecordsLoading />}>
        <CallRecordsContent initialCallRecords={callRecords} />
      </Suspense>
    </div>
  );
}
