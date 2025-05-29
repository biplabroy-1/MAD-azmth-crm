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
import { format, toZonedTime } from "date-fns-tz";

// Define time zones
const EST_TIMEZONE = "America/New_York";
const UTC_TIMEZONE = "UTC";

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
      utcTimeStart: string;
      utcTimeEnd: string;
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

    // Get current date
    const today = new Date();

    // Find the target day of the week
    const dayIndex = days.indexOf(day.toLowerCase());
    const currentDayIndex = today.getDay(); // Sunday is 0, Monday is 1, etc.

    // Calculate days to add to get to target day
    const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;

    // Create date for target day
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    // Set the time on the target date
    const [hours, minutes] = time.split(":");
    targetDate.setHours(
      Number.parseInt(hours, 10),
      Number.parseInt(minutes, 10),
      0,
      0
    );

    // First create the EST time object
    const estTime = toZonedTime(targetDate, EST_TIMEZONE);

    // Then convert it to UTC
    const utcTime = toZonedTime(estTime, UTC_TIMEZONE);

    // Format the UTC time as HH:mm
    return format(utcTime, "HH:mm");
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
            initSchedule[day][slot.id] = {
              assistantName: "",
              assistantId: "",
              callTimeStart: slot.start,
              callTimeEnd: slot.end,
              utcTimeStart: convertToUTC(slot.start, day),
              utcTimeEnd: convertToUTC(slot.end, day),
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

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: {
          assistantName: assistant?.name || "",
          assistantId: assistant?.id || "",
          callTimeStart: timeSlot?.start || "",
          callTimeEnd: timeSlot?.end || "",
          utcTimeStart: convertToUTC(timeSlot?.start || "", day),
          utcTimeEnd: convertToUTC(timeSlot?.end || "", day),
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
      // Convert all times to EST before sending to backend
      const scheduleForBackend = { ...schedule };

      // Convert times in each day and slot
      Object.keys(scheduleForBackend).forEach((day) => {
        Object.keys(scheduleForBackend[day]).forEach((slotId) => {
          const slot = scheduleForBackend[day][slotId];

          // Update UTC times based on the current EST times
          scheduleForBackend[day][slotId] = {
            ...slot,
            // Convert local times to UTC for the backend
            utcTimeStart: convertToUTC(slot.callTimeStart, day),
            utcTimeEnd: convertToUTC(slot.callTimeEnd, day),
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
