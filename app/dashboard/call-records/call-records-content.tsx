"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, RefreshCw, Search, PhoneOff } from "lucide-react";
import CallDetailModal from "@/components/call-detail-modal";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import xlsx from "json-as-xlsx";
import { useQuery } from "@tanstack/react-query";
import { getCallRecords } from "./actions";
import type { CallData } from "@/types";

interface ApiResponse {
  records: CallData[];
  total: number;
  page: number;
  totalPages: number;
}

export function CallRecordsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const limit = 100;

  const { data, isFetching, refetch } = useQuery<ApiResponse>({
    queryKey: ["callRecords", page],
    queryFn: async () => {
      return getCallRecords({ page, limit });
    },
  });

  // Local search filtering (client-only)
  const filteredRecords =
    data?.records.filter(
      (record) =>
        record.customer?.number?.includes(searchTerm) ||
        record.customer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.phoneNumber?.number?.includes(searchTerm)
    ) || [];

  const exportAsCSV = () => {
    const dataExport = [
      {
        sheet: "Call Records",
        columns: [
          { label: "Caller ID", value: "id" },
          { label: "Name", value: "name" },
          { label: "Phone Number", value: "number" },
          { label: "Via", value: "twilioPhoneNumber" },
          { label: "Started At", value: "startedAt" },
          { label: "Ended At", value: "endedAt" },
          { label: "Duration", value: "duration" },
          { label: "Call Summary", value: "summary" },
        ],
        content: filteredRecords.map((record) => ({
          id: record._id,
          name: record.customer?.name || "Unknown",
          number: record.customer?.number || "N/A",
          twilioPhoneNumber: record.phoneNumber?.number || "N/A",
          startedAt: formatDate(record.startedAt || record.startedAt),
          endedAt: formatDate(record.endedAt || ""),
          duration: formatDuration(
            record.startedAt || "",
            record.endedAt || ""
          ),
          summary: record.analysis?.summary || "",
        })),
      },
    ];
    xlsx(dataExport, { fileName: "CallRecords" });
  };

  const handleCardClick = (call: CallData) => {
    setSelectedCall(call);
  };

  const closeModal = () => {
    setSelectedCall(null);
  };

  return (
    <>
      <div className="flex w-full justify-between items-center">
        <div className="">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Call Records
            </h1>
            <p className="text-muted-foreground mt-1">
              {data?.records.length}{" "}
              {data?.records.length === 1 ? "record" : "records"} found
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={exportAsCSV}
            className="w-full sm:w-auto"
          >
            Export as CSV
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, number or Twilio number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No call records found</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchTerm
              ? "No records match your search criteria. Try a different search term."
              : "No call records available. Initiate calls to see records here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((call) => (
            <Card
              key={call._id}
              className="transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group"
              onClick={() => handleCardClick(call)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">
                      {call.customer?.name || "Unknown Caller"}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {call.customer?.number || "N/A"}
                    </CardDescription>
                    <CardDescription className="line-clamp-1 text-xs mt-1">
                      Via: {call.phoneNumber?.number || "N/A"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-text">
                    {call.endedReason}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {formatDate(call.startedAt || call.startedAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      Duration:{" "}
                      {formatDuration(call.startedAt || "", call.endedAt || "")}
                    </span>
                  </div>
                  {call.endedReason === "customer-did-not-answer" && (
                    <div className="flex items-center text-orange-600">
                      <PhoneOff className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Customer did not answer</span>
                    </div>
                  )}
                  {call.analysis?.summary && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {call.analysis?.summary}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span>
          Page {data?.page} of {data?.totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === data?.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {selectedCall && (
        <CallDetailModal call={selectedCall} onClose={closeModal} />
      )}
    </>
  );
}
