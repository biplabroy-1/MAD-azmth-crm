import { Suspense } from "react";
import { CallRecordsLoading } from "./call-records-loading";
import { CallRecordsLoader } from "./call-records-loader"; // server component below

export default function CallRecordsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CallRecordsLoading />}>
        <CallRecordsLoader />
      </Suspense>
    </div>
  );
}
