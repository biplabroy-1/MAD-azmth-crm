import { Loading } from "@/components/utils";
import { getAssistants } from "@/lib/vapiHelper";
import { Suspense } from "react";
import CreateCall from "./page-client";

export default async function Page() {
  const data = await getAssistants();
  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <CreateCall queueOptions={data} />
      </Suspense>
    </div>
  );
}
