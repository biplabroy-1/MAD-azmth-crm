import { Suspense } from "react";
import { CallRecordsLoading } from "./call-records-loading";
import { CallRecordsLoader } from "./call-records-loader"; // server component below
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export const dynamic = "force-dynamic";

const queryClient = new QueryClient();

export default function CallRecordsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CallRecordsLoading />}>
          <CallRecordsLoader />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
}
