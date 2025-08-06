"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSchedule } from "@/app/actions/scheduleActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Assistant, ScheduleSlot } from "@/types/interfaces";
import { toast } from "sonner";
import { convertETTimeToUTC } from "@/lib/utils";

const timeSlots = [
  {
    id: "morning",
    callTimeStartET: "09:00",
    callTimeEndET: "11:00",
    callTimeStart: "13:00",
    callTimeEnd: "15:00",
  },
  {
    id: "afternoon",
    callTimeStartET: "13:00",
    callTimeEndET: "15:00",
    callTimeStart: "17:00",
    callTimeEnd: "19:00",
  },
  {
    id: "evening",
    callTimeStartET: "18:00",
    callTimeEndET: "20:00",
    callTimeStart: "22:00",
    callTimeEnd: "00:00",
  },
];

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface Schedule {
  [key: string]: {
    [key: string]: ScheduleSlot;
  };
}

const createDefaultSchedule = (): Schedule => {
  const defaultSchedule: Schedule = {};
  days.forEach((day) => {
    defaultSchedule[day] = {};
    timeSlots.forEach((slot) => {
      defaultSchedule[day][slot.id] = {
        assistantName: "",
        assistantId: "",
        callTimeStart: "",
        callTimeEnd: "",
        callTimeStartET: "",
        callTimeEndET: "",
      };
    });
  });
  return defaultSchedule;
};

interface Props {
  assistants: Assistant[];
  initialSchedule: Schedule;
}

export default function ScheduleForm({ assistants, initialSchedule }: Props) {
  const defaultSchedule = createDefaultSchedule();

  const [schedule, setSchedule] = useState(initialSchedule || defaultSchedule);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSelect = (day: string, slotId: string, assistantId: string) => {
    const isNone = assistantId === "none";
    const assistant = !isNone
      ? assistants.find((a: Assistant) => a.id === assistantId)
      : null;
    const slot = timeSlots.find((s) => s.id === slotId);

    const callTimeStart = !isNone ? slot?.callTimeStartET || "" : "";
    const callTimeEnd = !isNone ? slot?.callTimeEndET || "" : "";
    setSchedule((prev: Schedule) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slotId]: {
          ...(prev[day]?.[slotId] || {}),
          assistantId: isNone ? "" : assistantId,
          assistantName: assistant?.name || "",
          callTimeStart: convertETTimeToUTC(callTimeStart),
          callTimeEnd: convertETTimeToUTC(callTimeEnd),
          callTimeStartET: callTimeStart,
          callTimeEndET: callTimeEnd,
        },
      },
    }));
  };

  const handleTimeChange = (
    day: string,
    slotId: string,
    type: "start" | "end",
    value: string
  ) => {
    setSchedule((prev: Schedule) => {
      const updatedSlot = {
        ...(prev[day]?.[slotId] || {}),
        [type === "start" ? "callTimeStartET" : "callTimeEndET"]: value,
      };

      updatedSlot.callTimeStart = convertETTimeToUTC(
        updatedSlot.callTimeStartET || ""
      );
      updatedSlot.callTimeEnd = convertETTimeToUTC(
        updatedSlot.callTimeEndET || ""
      );

      return {
        ...prev,
        [day]: {
          ...prev[day],
          [slotId]: updatedSlot,
        },
      };
    });
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      const res = await saveSchedule(schedule);
      toast(res.message);
      setStatus(res.message);
    });
  };

  return (
    <>
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
                        <SelectItem value="none">None</SelectItem>
                        {assistants.map((a: Assistant) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {schedule[day]?.[slot.id]?.assistantId && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={
                            schedule[day]?.[slot.id]?.callTimeStartET || ""
                          }
                          onChange={(e) =>
                            handleTimeChange(
                              day,
                              slot.id,
                              "start",
                              e.target.value
                            )
                          }
                          className="border rounded p-1"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={schedule[day]?.[slot.id]?.callTimeEndET || ""}
                          onChange={(e) =>
                            handleTimeChange(
                              day,
                              slot.id,
                              "end",
                              e.target.value
                            )
                          }
                          className="border rounded p-1"
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSubmit} disabled={isPending} className="mt-4">
        {isPending ? "Submitting..." : "Submit Schedule"}
      </Button>
      {status && <p className="mt-4 text-sm text-gray-500">{status}</p>}
    </>
  );
}
