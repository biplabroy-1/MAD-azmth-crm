"use client";

import { CallData } from "@/types";
import { AnalyticsData } from "@/types/interfaces";
import xlsx from "json-as-xlsx";
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}

export const prepareChartData = (analyticsData: AnalyticsData) => {
  if (!analyticsData?.data) return null;
  const calls = analyticsData.data;
  // For duration distribution
  const durationRanges: Record<string, number> = {
    "30-60s": 0,
    "1-2m": 0,
    "2-5m": 0,
    "5m+": 0,
  };
  if (calls.length > 0) {
    calls.forEach((call) => {
      const duration = call.durationSeconds ?? 0;
      if (duration > 0 && duration <= 60) durationRanges["30-60s"]++;
      else if (duration > 60 && duration <= 120) durationRanges["1-2m"]++;
      else if (duration > 120 && duration <= 300) durationRanges["2-5m"]++;
      else if (duration > 300) durationRanges["5m+"]++;
    });
  }
  return {
    durationData: {
      labels: Object.keys(durationRanges),
      datasets: [
        {
          label: "Call Duration Distribution",
          data: Object.values(durationRanges),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    },
  };
};

export const exportSuccessfulCallsToCSV = (calls: CallData[]) => {
  if (!calls.length) return;

  const data = [
    {
      sheet: "Successful Calls",
      columns: [
        { label: "Phone Number", value: "phoneNumber" },
        { label: "Customer Name", value: "customerName" },
        { label: "Customer Number", value: "customerNumber" },
        { label: "Duration", value: "duration" },
        { label: "Assistant", value: "assistant" },
        { label: "Started At", value: "startedAt" },
        { label: "Ended Reason", value: "endedReason" },
        { label: "Success Evaluation", value: "successEvaluation" },
        { label: "Recording URL", value: "recordingUrl" },
        { label: "Analysis Summary", value: "analysisSummary" },
        { label: "Transcript", value: "transcript" },
      ],
      content: calls.map((call) => ({
        phoneNumber: call.call?.phoneNumber.twilioPhoneNumber ?? "Unknown",
        customerName: call.customer?.name ?? "Unknown",
        customerNumber: call.customer?.number ?? "Unknown",
        duration:
          call.durationSeconds !== undefined
            ? `${Math.floor(call.durationSeconds / 60)}m ${(
                call.durationSeconds % 60
              ).toFixed(2)}s`
            : "N/A",
        assistant: call.assistant?.name ?? "Unknown",
        startedAt: call.startedAt
          ? new Date(call.startedAt).toLocaleString()
          : "Unknown",
        endedReason: call.endedReason ?? "N/A",
        successEvaluation: call.analysis?.successEvaluation ?? "N/A",
        recordingUrl: call.recordingUrl ?? "N/A",
        analysisSummary: call.analysis?.summary ?? "N/A",
        transcript: call.transcript ?? "N/A",
      })),
    },
  ];

  const settings = {
    fileName: `SuccessfulCalls List`,
    extraLength: 0,
    writeMode: "writeFile",
    writeOptions: {},
    RTL: false,
  };

  xlsx(data, settings);
};
