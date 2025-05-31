"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isEasternDaylightTime } from "@/lib/utils";

// Define days of the week
const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface Schedule {
  [key: string]: {
    [key: string]: {
      assistantName: string;
      assistantId: string;
      callTimeStart: string;
      callTimeEnd: string;
      utcTimeStart?: string;
      utcTimeEnd?: string;
    };
  };
}

const initialTimeSlots = [
  { id: "morning", start: "09:00", end: "12:00" },
  { id: "afternoon", start: "13:00", end: "16:00" },
  { id: "evening", start: "17:00", end: "20:00" },
];

export default function SchedulePage() {
  const { userId } = useAuth();
  const [assistants, setAssistants] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [status, setStatus] = useState("");
  const [timeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const convertToUTC = useCallback((time: string, day: string): string => {
    if (!time) return "";

    // Parse the input time
    const [hours, minutes] = time
      .split(":")
      .map((part) => Number.parseInt(part, 10));
    if (isNaN(hours) || isNaN(minutes)) return "";

    // Get the current date and create a new date for the future day
    const now = new Date();

    // Find the day of week index (0 = Sunday, 6 = Saturday)
    const dayIndex = days.indexOf(day.toLowerCase());
    const currentDayIndex = now.getDay();

    // Calculate days to add to get to the target day
    const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;

    // Create a date for the target day
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysToAdd);

    // Set the EST time (which is what we're assuming the input is)
    targetDate.setHours(hours, minutes, 0, 0);

    // Check if target date is in EDT (Daylight Savings Time)
    const isDST = isEasternDaylightTime(targetDate);

    // Manual EST/EDT to UTC conversion
    // EST is UTC-5, EDT is UTC-4
    let utcHours = hours + (isDST ? 4 : 5);
    let utcMinutes = minutes;

    // Handle day boundary crossing
    if (utcHours >= 24) {
      utcHours -= 24;
    }

    // Format as HH:MM
    return `${utcHours.toString().padStart(2, "0")}:${utcMinutes
      .toString()
      .padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const assistantsResponse = await fetch("/api/get-assistants");

        if (!assistantsResponse.ok) {
          throw new Error("Failed to fetch assistants");
        }

        const assistantsData = await assistantsResponse.json();
        // Ensure assistantsData is an array
        setAssistants(
          Array.isArray(assistantsData.assistants)
            ? assistantsData.assistants
            : []
        );

        if (userId) {
          const scheduleResponse = await fetch(`/api/schedule`);
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            setSchedule(scheduleData.weeklySchedule || {});
            return;
          }
        }
        const initSchedule: Schedule = {};
        days.forEach((day) => {
          initSchedule[day] = {};
          timeSlots.forEach((slot) => {
            // Calculate UTC times using native JS immediately
            const utcTimeStart = convertToUTC(slot.start, day);
            const utcTimeEnd = convertToUTC(slot.end, day);

            initSchedule[day][slot.id] = {
              assistantName: "",
              assistantId: "",
              callTimeStart: slot.start,
              callTimeEnd: slot.end,
              utcTimeStart: utcTimeStart,
              utcTimeEnd: utcTimeEnd,
            };
          });
        });
        setSchedule(initSchedule);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, timeSlots, convertToUTC]);
  const handleTimeChange = (
    day: string,
    slotId: string,
    type: "start" | "end",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const time = event.target.value;
    // Calculate UTC time immediately using native JS
    const utcTime = convertToUTC(time, day);

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: {
          ...prev[day][slotId],
          [type === "start" ? "callTimeStart" : "callTimeEnd"]: time,
          [type === "start" ? "utcTimeStart" : "utcTimeEnd"]: utcTime,
        },
      },
    }));
  };
  const handleSelect = (day: string, slot: string, assistantId: string) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    const timeSlot = timeSlots.find((t) => t.id === slot);

    // Calculate the UTC times immediately using our native JS function
    const utcTimeStart = convertToUTC(timeSlot?.start || "", day);
    const utcTimeEnd = convertToUTC(timeSlot?.end || "", day);

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          assistantName: assistant?.name || "",
          assistantId: assistant?.id || "",
          callTimeStart: timeSlot?.start || "",
          callTimeEnd: timeSlot?.end || "",
          utcTimeStart: utcTimeStart,
          utcTimeEnd: utcTimeEnd,
        },
      },
    }));
  };
  const handleSubmit = async () => {
    if (!userId) {
      setStatus("User not authenticated");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      // Create a clone of the schedule data
      const scheduleForBackend = { ...schedule };

      // Update all UTC times based on current EST times
      Object.keys(scheduleForBackend).forEach((day) => {
        Object.keys(scheduleForBackend[day]).forEach((slotId) => {
          const slot = scheduleForBackend[day][slotId];

          slot.callTimeStart = convertToUTC(slot.callTimeStart, day);
          slot.callTimeEnd = convertToUTC(slot.callTimeEnd, day);
          delete slot.utcTimeStart;
          delete slot.utcTimeEnd;
          // Update UTC times based on the current EST times
          scheduleForBackend[day][slotId] = {
            ...slot,
          };
        });
      });

      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklySchedule: scheduleForBackend,
          clerkId: userId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit schedule");
      }

      setStatus("Schedule submitted successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error occurred while submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Set Weekly Assistant Schedule (EDT)
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            {timeSlots.map((slot) => (
              <TableHead key={slot.id} className="capitalize">
                {slot.id}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => (
            <TableRow key={day}>
              <TableCell className="capitalize">{day}</TableCell>
              {timeSlots.map((slot) => (
                <TableCell key={slot.id}>
                  <div className="space-y-2">
                    <Select
                      value={schedule[day]?.[slot.id]?.assistantId || ""}
                      onValueChange={(value) =>
                        handleSelect(day, slot.id, value)
                      }
                    >
                      <SelectTrigger className="max-w-96">
                        <SelectValue placeholder="Select Assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {assistants.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 items-center">
                      <input
                        type="time"
                        value={schedule[day]?.[slot.id]?.callTimeStart}
                        onChange={(e) =>
                          handleTimeChange(day, slot.id, "start", e)
                        }
                        className="border rounded p-1"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={schedule[day]?.[slot.id]?.callTimeEnd}
                        onChange={(e) =>
                          handleTimeChange(day, slot.id, "end", e)
                        }
                        className="border rounded p-1"
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      UTC: {schedule[day]?.[slot.id]?.utcTimeStart} -{" "}
                      {schedule[day]?.[slot.id]?.utcTimeEnd}
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button onClick={handleSubmit} className="mt-4" disabled={loading}>
        {loading ? "Submitting..." : "Submit Schedule"}
      </Button>

      {status && (
        <p
          className={`mt-4 ${
            status.includes("Error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {status}
        </p>
      )}
    </main>
  );
}
