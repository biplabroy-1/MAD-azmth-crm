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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ContentLoading } from "./loading";
import { CallData } from "@/types";

interface ApiResponse {
  records: CallData[];
  total: number;
  page: number;
  totalPages: number;
}

export default function CallRecordsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [limit, setLimit] = useState(100);
  const [assistantId, setAssistantId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isFetching, refetch } = useQuery<ApiResponse>({
    queryKey: ["callRecords", page, limit, assistantId, phoneNumber, startDate, endDate],
    queryFn: async () => {
      return getCallRecords({ page, limit, assistantId, phoneNumber, startDate, endDate });
    },

    refetchOnWindowFocus: false,
  });

  // Local search filtering (client-only)
  const filteredRecords =
    data?.records.filter(
      (record) =>
        record.customer?.number?.includes(searchTerm) ||
        record.customer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.call.phoneNumber?.twilioPhoneNumber?.includes(searchTerm)
    ) || [];

  // get all unique phone numbers
  const uniquePhoneNumbers = Array.from(
    new Set(filteredRecords.map((record) => record.call.phoneNumber?.twilioPhoneNumber))
  );
  // get all unique assistents name and ids
  const uniqueAssistants = Array.from(
    new Map(
      filteredRecords
        .filter((record) => record.assistant)
        .map((record) => [record.assistant.name, record.assistant.id])
    )
  ).map(([name, id]) => ({ name, id }));

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
          twilioPhoneNumber: record.call.phoneNumber?.twilioPhoneNumber || "N/A",
          startedAt: formatDate(record.startedAt),
          endedAt: formatDate(record.endedAt || ""),
          duration: record.durationSeconds,
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
      <div className="flex w-full justify-between items-center mb-6">
        {/* Title + Count */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Call Records
          </h1>
          <p className="text-muted-foreground mt-1">
            {data?.records.length}{" "}
            {data?.records.length === 1 ? "record" : "records"} found
          </p>
        </div>

        {/* Filters + Actions */}
        <div className="flex flex-col items-center sm:flex-row gap-3 w-full md:w-auto">

          {/* Limit Selector */}
          <div className="flex items-center gap-2">
            <Label>Limit</Label>
            <Select
              onValueChange={(value) => setLimit(parseInt(value))}
              value={limit.toString()}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assistant Filter */}
          <div className="flex items-center gap-2">
            <Label>Assistant</Label>
            <Select
              onValueChange={(value) => {
                console.log(value)
                setAssistantId(value)
              }}
              value={assistantId}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All assistants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueAssistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number Filter */}
          <div className="flex items-center gap-2">
            <Label>Number</Label>
            <Select
              onValueChange={(value) => setPhoneNumber(value)}
              value={phoneNumber}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All numbers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniquePhoneNumbers.map((number) => (
                  <SelectItem key={number} value={number}>
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Label>Date Range</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
            <span>-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
            />
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={exportAsCSV}
            className="w-full sm:w-auto"
          >
            Export as CSV
          </Button>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, number or Twilio number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Refresh Button */}
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
      </div >


      {
        isFetching ? (
          <ContentLoading />
        ) : filteredRecords.length === 0 ? (
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
                        Via: {call.call.phoneNumber?.twilioPhoneNumber || "N/A"}
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
                        {formatDate(call.startedAt || call.call.createdAt)}
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
        )
      }

      {/* Pagination Controls */}
      <div className="flex border fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background p-4 px-6 rounded-full w-fit z-50 justify-center items-center gap-3 mt-6">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span className="text-sm opacity-75">
          Page {data?.page} of {data?.totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= (data?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {
        selectedCall && (
          <CallDetailModal call={selectedCall} onClose={closeModal} />
        )
      }
    </>
  );
}
