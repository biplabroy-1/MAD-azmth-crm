"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useId } from "react";

const timeSlots = ["Morning", "Afternoon", "Evening"];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Loading() {
  const id = useId();

  return (
    <div className="max-h-screen overflow-hidden flex flex-col p-2 sm:p-4 space-y-6">
      {/* Scrollable table skeleton */}
      <div className="flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <div className="min-w-[850px] border rounded-md">
            {/* Table header */}
            <div className="flex border-b">
              {/* Day column */}
              <div className="w-28 p-3">
                <Skeleton className="h-4 w-16" />
              </div>
              {/* Time slot headers */}
              {timeSlots.map((slot, i) => (
                <div
                  key={`${id}-header-${i}`}
                  className="flex-1 p-3 text-center"
                >
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>

            {/* Table rows */}
            {days.map((day, rowIdx) => (
              <div
                key={`${id}-row-${rowIdx}`}
                className="flex border-b last:border-b-0 text-xs h-20"
              >
                {/* Day label cell */}
                <div className="w-28 p-3 flex items-center">
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Slots cells */}
                {timeSlots.map((slot, colIdx) => (
                  <div
                    key={`${id}-cell-${rowIdx}-${colIdx}`}
                    className="flex-1 p-2 flex flex-col sm:flex-row gap-2 items-center"
                  >
                    {/* Assistant select skeleton */}
                    <Skeleton className="h-10 w-48 sm:w-56" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit button skeleton */}
      <Skeleton className="h-10 w-36" />
    </div>
  );
}
