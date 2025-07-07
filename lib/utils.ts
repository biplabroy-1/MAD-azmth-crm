import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs"
import moment from "moment-timezone";
import type { ScheduleSlot } from "@/types/interfaces";

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
    const { callTimeStart, callTimeEnd } = slotData as ScheduleSlot;

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

// Helper function to check if date is in EST DST
export function isEasternDaylightTime(date: Date): boolean {

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31

  if (month < 2 || month > 10) {
    // January, February, December are always EST (not EDT)
    return month < 2 ? false : false;
  }

  if (month > 2 && month < 10) {
    // April through October are always EDT (except possibly early November)
    return true;
  }

  // For March, EDT starts on the second Sunday at 2 AM
  if (month === 2) {
    // Calculate second Sunday
    const secondSunday = new Date(year, 2, 1);
    secondSunday.setDate(1 + (7 - secondSunday.getDay()) + 7); // First Sunday + 7 days

    // Before second Sunday = EST, on or after = EDT
    const dayOfMonth = secondSunday.getDate();
    return day > dayOfMonth || (day === dayOfMonth && date.getHours() >= 2);
  }

  // For November, EDT ends on the first Sunday at 2 AM
  if (month === 10) {
    // Calculate first Sunday
    const firstSunday = new Date(year, 10, 1);
    firstSunday.setDate(1 + ((7 - firstSunday.getDay()) % 7));

    // Before first Sunday = EDT, on or after = EST
    const dayOfMonth = firstSunday.getDate();
    return day < dayOfMonth || (day === dayOfMonth && date.getHours() < 2);
  }

  return false;
}

export function convertToUTC(time: string, day: string): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const dayIndex = days.indexOf(day);
  const delta = (dayIndex - now.getDay() + 7) % 7;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + delta);
  targetDate.setHours(hours, minutes, 0, 0);
  const isDST = isEasternDaylightTime(targetDate);
  const utcHours = hours + (isDST ? 4 : 5);
  return `${String(utcHours % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export async function getAssistents() {
  const response = await fetch("https://api.vapi.ai/assistant", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return await response.json();
  }

  return await response.json();
}

export function convertETTimeToUTC(time: string): string {
  const today = moment().format("YYYY-MM-DD"); // current date
  const etTime = moment.tz(`${today} ${time}`, "YYYY-MM-DD HH:mm", "America/New_York");

  if (!etTime.isValid()) return "";

  return etTime.utc().format("HH:mm");
}