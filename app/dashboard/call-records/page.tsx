import { Suspense } from "react";
import { CallRecordsLoading } from "./call-records-loading";
import { CallRecordsContent } from "./call-records-content";
export const dynamic = "force-dynamic";

export default function CallRecordsPage() {
  return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CallRecordsLoading />}>
          <CallRecordsContent />
        </Suspense>
      </div>
  );
}
