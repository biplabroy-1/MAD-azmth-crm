export const dynamic = "force-dynamic";

import { CallRecordsContent } from "./call-records-content";
import { getCallRecords } from "./actions";

export async function CallRecordsLoader() {
  const { records, total} = await getCallRecords({
    page: 1,
    limit: 100,
  });
  return (
    <div className="flex flex-col items-start md:items-center gap-4 mb-8">
      <CallRecordsContent initialCallRecords={records} initialTotal={total} />
    </div>
  );
}
