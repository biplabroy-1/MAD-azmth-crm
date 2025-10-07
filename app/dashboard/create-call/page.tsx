import { Loading } from "@/components/utils";
import { getAssistants } from "@/lib/vapiHelper";
import { Suspense } from "react";
import InstantCall from "./instant-call-client";
import ScheduleCall from "./schedule-call-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const data = await getAssistants();
  const user = await currentUser();
  const usage = user ? {
    callCount: user.privateMetadata?.callCount || 0,
  } : null;

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create a Call</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Use <b>Instant Call</b> to quickly call a single contact, or <b>Schedule Call</b> to queue calls for later as per your saved schedule. Make sure you have a schedule set up for assistants before scheduling.
        </p>
      </div>
      <Tabs defaultValue="instant" className="w-full max-w-2xl mx-auto">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="instant">Instant Call</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Call</TabsTrigger>
        </TabsList>
        {usage && (
          <div className="text-sm text-muted-foreground w-full mb-2 text-center">
            {"📞"} You have used {usage.callCount as number} of 3 call(s).
          </div>
        )}
        <TabsContent value="instant">
          <Suspense fallback={<Loading />}>
            <InstantCall queueOptions={data} />
          </Suspense>
        </TabsContent>
        <TabsContent value="schedule">
          <Suspense fallback={<Loading />}>
            <ScheduleCall queueOptions={data} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
