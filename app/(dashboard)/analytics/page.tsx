import { Suspense } from "react";
import AnalyticsPage from "./page-client";
import { getAssistents } from "@/lib/vapiHelper";
import { Loading } from "@/components/utils";

export default async function Page() {
  const data = await getAssistents();
  if (!data) return null;
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <AnalyticsPage assistants={data} />
      </Suspense>
    </div>
  );
}
