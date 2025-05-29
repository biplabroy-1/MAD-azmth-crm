import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusBadge = (status: string, endedReason?: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    ended: {
      color:
        endedReason === "customer-did-not-answer"
          ? "bg-orange-100 text-orange-800"
          : "bg-green-100 text-green-800",
      text:
        endedReason === "customer-did-not-answer" ? "No Answer" : "Completed",
    },
    failed: { color: "bg-red-100 text-red-800", text: "Failed" },
    "in-progress": { color: "bg-blue-100 text-blue-800", text: "In Progress" },
    queued: { color: "bg-yellow-100 text-yellow-800", text: "Queued" },
    initiated: { color: "bg-purple-100 text-purple-800", text: "Initiated" },
  };

  return (
    statusMap[status] || { color: "bg-gray-100 text-gray-800", text: status }
  );
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return "N/A";

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const durationMs = end - start;

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes > 0 ? `${minutes}m ` : ""}${remainingSeconds}s`;
};


// Schedule utility functions
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | null;
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export const getCurrentTimeSlot = (weeklySchedule: any, dayOfWeek: string): any | null => {
  const now = dayjs();
  const currentTime = now.format("HH:mm");

  const slots = weeklySchedule?.[dayOfWeek];
  if (!slots) return null;

  for (const [slotName, slotData] of Object.entries(slots)) {
    const { callTimeStart, callTimeEnd } = slotData as any;

    if (callTimeStart && callTimeEnd && currentTime >= callTimeStart && currentTime <= callTimeEnd) {
      return { slotName, slotData };
    }
  }

  return { slotName: null, slotData: null }; // No matching slot
};


export const getCurrentDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};