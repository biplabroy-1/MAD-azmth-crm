import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData, OverviewData } from "@/types/interfaces";
import { getAssistantsList } from "@/app/actions/assistantActions";

export function useAnalyticsData(debouncedFilters: {
  successOnly: boolean;
  excludeVoicemail: boolean;
  minDuration: number;
  startDate?: string;
  endDate: string;
}) {
  return useQuery<AnalyticsData>({
    queryKey: ["analyticsData", debouncedFilters],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        successOnly: debouncedFilters.successOnly.toString(),
        excludeVoicemail: debouncedFilters.excludeVoicemail.toString(),
        minDuration: debouncedFilters.minDuration.toString(),
        ...(debouncedFilters.startDate && {
          startDate: debouncedFilters.startDate,
        }),
        ...(debouncedFilters.endDate && {
          endDate: debouncedFilters.endDate,
        }),
      });
      const response = await fetch(`/api/get-analytics?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 0
  });
}

export function useOverviewData() {
  return useQuery<OverviewData>({
    queryKey: ["overviewData"],
    queryFn: async () => {
      const response = await fetch("/api/overview");
      if (!response.ok) {
        throw new Error("Failed to fetch overview data");
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 0
  });
}

export function useAssistentData() {
  return useQuery({
    queryKey: ["assistants"],
    queryFn: async () => {
      return await getAssistantsList();
    }
  });
}