"use client";

import {
  Calendar,
  Clock,
  Clock3,
  Hash,
  MessageSquare,
  Phone,
  User,
  X,
} from "lucide-react";
import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { AnalyticsCallRecord } from "@/types/interfaces";

interface CallDetailModalProps {
  call: AnalyticsCallRecord;
  onClose: () => void;
}

export default function CallDetailModal({
  call,
  onClose,
}: CallDetailModalProps) {
  const id = useId();
  const formatTranscript = (transcript: string) => {
    if (!transcript) return null;

    return transcript.split("\n").map((line, index) => {
      const isAI = line.startsWith("AI:");
      const isUser = line.startsWith("User:");
      const stableKey = `${id}-${
        isAI ? "ai" : isUser ? "user" : "other"
      }-${index}-${line.substring(0, 10).replace(/\s/g, "")}`;
      return (
        <div
          key={stableKey}
          className={`mb-3 p-3 rounded-lg ${
            isAI
              ? "bg-blue-50 border-l-4 border-blue-500"
              : isUser
              ? "bg-gray-50 border-l-4 border-gray-400"
              : ""
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`p-1.5 rounded-full mt-0.5 ${
                isAI
                  ? "bg-blue-100 text-blue-600"
                  : isUser
                  ? "bg-gray-100 text-gray-600"
                  : ""
              }`}
            >
              {isAI ? (
                <MessageSquare className="h-4 w-4" />
              ) : isUser ? (
                <User className="h-4 w-4" />
              ) : null}
            </div>
            <div className="flex-1 break-words">
              <p
                className={`text-sm font-medium mb-1 ${
                  isAI ? "text-blue-800" : isUser ? "text-gray-800" : ""
                }`}
              >
                {isAI ? "Assistant" : isUser ? "Customer" : ""}
              </p>
              <p className="text-sm">
                {line.replace(/^(AI:|User:)/, "").trim()}
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-4 overflow-hidden md:w-4/5 sm:w-11/12">
        <DialogHeader className="border-b p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <DialogTitle className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Call Details
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1 text-xs md:text-sm overflow-hidden text-ellipsis">
                <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono truncate">{call._id}</span>
              </DialogDescription>
            </div>
            <Badge variant="outline">{call.endedReason}</Badge>
          </div>
        </DialogHeader>

        {/* Using a fixed height container with overflow-auto instead of ScrollArea for more reliable scrolling */}
        <div className="flex-1 overflow-auto h-[calc(90vh-140px)]">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {call.customer?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="font-medium">
                        {call.customer?.number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-primary" />
                  Call Timing
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Started At
                      </p>
                      <p className="font-medium">
                        {formatDate(call.startedAt as string)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{call.durationSeconds}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {call.analysis?.summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Call Summary
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-line">
                    {call.analysis?.summary}
                  </p>
                </div>
              </div>
            )}

            {call.transcript && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Full Transcript
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {formatTranscript(call.transcript)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t p-4 mt-auto">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <X className="h-4 w-4" />
            Close Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
