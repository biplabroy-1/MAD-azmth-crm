export const dynamic = "force-dynamic";

import { getAllCalls } from "@/lib/vapiHelper";
import { CallRecordsContent } from "./call-records-content";

export async function CallRecordsLoader() {
  const callRecords = await getAllCalls(1000);
  if (!callRecords) return null;

  return <CallRecordsContent initialCallRecords={callRecords} />;
}
