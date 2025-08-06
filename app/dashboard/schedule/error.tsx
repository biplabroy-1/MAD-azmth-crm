"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ScheduleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ScheduleError({ error, reset }: ScheduleErrorProps) {
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            Error Loading Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            There was an error loading your schedule data. This could be due to
            a network issue or server problem.
          </p>
          <div className="bg-muted p-3 rounded-md text-sm">
            <strong>Error details:</strong> {error.message}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
