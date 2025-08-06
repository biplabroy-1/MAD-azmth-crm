import { Skeleton } from "@/components/ui/skeleton";
import { useId } from "react";

export default function Loading() {
  const id = useId();
  return (
    <div className="space-y-6">
      {/* Form header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="border rounded-md">
          {/* Table header */}
          <div className="flex items-center space-x-4 p-4 border-b">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={`skeleton-row-${id}-${index}`}
              className="flex items-center space-x-4 p-4 border-b last:border-b-0"
            >
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Save button skeleton */}
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
