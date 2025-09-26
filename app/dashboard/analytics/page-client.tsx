"use client";
import { useAuth } from "@clerk/nextjs";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { format, formatDistanceToNow } from "date-fns";
import xlsx from "json-as-xlsx";
import { Download, Search, Trash } from "lucide-react";
import { useState } from "react";
import { useAnalyticsData, useAssistentData, useOverviewData } from "./useAnalyticsData";
import { Bar, Pie } from "react-chartjs-2";
import CallDetailModal from "@/components/call-detail-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type {
  AssistantContacts,
  Contacts,
  AssistantAggregatedStats,
} from "@/types/interfaces";
import {
  exportSuccessfulCallsToCSV,
  prepareChartData,
  useDebounce,
} from "@/components/utils";
import { OverviewSkeleton } from "./overview-skeleton";
import { DetailedSkeleton } from "./detailed-skeleton";
import { CallData } from "@/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [selectedAssistantIdForModal, setSelectedAssistantIdForModal] =
    useState<string | null>(null);
  const [assistantContacts, setAssistantContacts] =
    useState<AssistantContacts | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [activeContactTab, setActiveContactTab] = useState("queued");
  const [filters, setFilters] = useState({
    successOnly: true,
    excludeVoicemail: true,
    minDuration: 30,
    startDate: "",
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const { userId } = useAuth();
  const assistants = useAssistentData().data?.assistants || [];

  // Debounce filter changes to prevent too many API calls
  const debouncedFilters = useDebounce(filters, 1500);
  const {
    data: analyticsData,
    isFetching: analyticsLoading,
    refetch: analyticsRefetch,
  } = useAnalyticsData(debouncedFilters);
  const {
    data: overviewData,
    isFetching: overviewLoading,
    refetch: overviewRefetch,
  } = useOverviewData();

  const overView = overviewData?.data;

  const chartData = analyticsData ? prepareChartData(analyticsData) : null;

  const calls: CallData[] = analyticsData?.data || [];

  // Contact management functions
  const filterContacts = (contacts: Contacts[], searchTerm: string) => {
    if (!searchTerm) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number?.includes(searchTerm)
    );
  };

  const handleSelectAllContacts = (
    contacts: Contacts[],
    isChecked: boolean
  ) => {
    const contactIds = contacts.map((contact) => contact._id);
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        contactIds.forEach((id) => newSet.add(id));
      } else {
        contactIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });
  };

  const handleSelectContact = (contactId: string, isChecked: boolean) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(contactId);
      } else {
        newSet.delete(contactId);
      }
      return newSet;
    });
  };

  const handleDeleteQueuedContacts = async () => {
    if (selectedContacts.size === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select contacts to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/delete-queued-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactIds: Array.from(selectedContacts),
          assistantId: selectedAssistantIdForModal,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete contacts");
      }

      // Refresh the contacts after deletion
      if (selectedAssistantIdForModal) {
        await fetchAssistantContacts(selectedAssistantIdForModal);
      }

      // Clear selection
      setSelectedContacts(new Set());

      toast({
        title: "Success",
        description: `${selectedContacts.size} contact(s) deleted successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast({
        title: "Error",
        description: "Failed to delete contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportContactsToXLSX = (contacts: Contacts[], tabName: string) => {
    const selectedContactsList = contacts.filter((contact) =>
      selectedContacts.has(contact._id)
    );

    if (!selectedContactsList.length) {
      toast({
        title: "No contacts selected",
        description: "Please select contacts to export.",
        variant: "destructive",
      });
      return;
    }

    const data = [
      {
        sheet: `${tabName} Contacts`,
        columns: [
          { label: "Name", value: "name" },
          { label: "Number", value: "number" },
          { label: "Status", value: "status" },
          { label: "Created At", value: "createdAt" },
          ...(tabName === "Failed"
            ? [{ label: "Reason", value: "reason" }]
            : []),
        ],
        content: selectedContactsList.map((contact) => ({
          name: contact.name || "Unnamed Contact",
          number: contact.number,
          status: contact.status,
          createdAt: contact.createdAt
            ? new Date(contact.createdAt).toLocaleString()
            : "N/A",
          ...(contact.reason && { reason: contact.reason }),
        })),
      },
    ];

    const settings = {
      fileName: `${tabName}_Contacts_${format(new Date(), "yyyy-MM-dd")}`,
      extraLength: 0,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    xlsx(data, settings);

    toast({
      title: "Export successful",
      description: `${selectedContactsList.length
        } ${tabName.toLowerCase()} contacts exported.`,
      variant: "default",
    });
  };

  function startQueue() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/start-queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clerkId: userId,
      }),
    })
      .then((response) => response.text())
      .then(() =>
        toast({
          title: "Success",
          description: "Started Queue",
          variant: "default",
        })
      )
      .catch((error) =>
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      );
  }

  const fetchAssistantContacts = async (assistantId: string) => {
    setAssistantContacts(null); // Clear previous contacts and show loading
    setSelectedContacts(new Set()); // Clear selected contacts
    setContactSearchTerm(""); // Clear search term
    try {
      const response = await fetch(
        `/api/get-assistant-contacts?assistantId=${assistantId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assistant contacts");
      }
      const contacts: AssistantContacts = await response.json();
      setAssistantContacts(contacts);
    } catch (err) {
      console.error("Error fetching assistant contacts:", err);
      setAssistantContacts(null); // Set to empty array on error
      toast({
        title: "Error",
        description: "Failed to load contacts for this assistant.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (call: CallData) => {
    setSelectedCall(call);
  };

  const closeModal = () => {
    setSelectedCall(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Call Analytics</h1>
        <div className="flex items-center gap-4">
          <Button onClick={startQueue}>Start Queue</Button>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Overview Data</h2>

            <div className="flex items-center gap-2">
              {/* Overview refresh */}
              <Button
                variant="outline"
                onClick={() => overviewRefetch()}
                className="flex items-center gap-2"
              >
                {overviewLoading ? "Refreshing..." : "Refresh Overview"}
              </Button>
            </div>
          </div>

          {overviewLoading ? (
            <OverviewSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Queue Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Queue Stats</CardTitle>
                  <CardDescription>
                    Current call processing status
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">In Queue</p>
                      <p className="text-2xl font-bold">
                        {overView?.queueStats?.totalInQueue ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Initiated</p>
                      <p className="text-2xl font-bold">
                        {overView?.queueStats?.totalInitiated ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">
                        {overView?.queueStats?.totalCompleted ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-500">
                        {overView?.queueStats?.totalFailed ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-green-500">
                        {(overView?.queueStats?.successRate ?? 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Queue Stats per Assistant */}
              <Card>
                <CardHeader>
                  <CardTitle>Queue Stats Per Assistant</CardTitle>
                  <CardDescription>
                    Current call processing status per assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {overView?.queueStats?.assistantSpecific ? (
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">
                              In Queue
                            </TableHead>
                            <TableHead className="text-center">
                              Initiated
                            </TableHead>
                            <TableHead className="text-center">Done</TableHead>
                            <TableHead className="text-center">
                              Failed
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(
                            overView.queueStats.assistantSpecific
                          ).map(([assistantId, stats]) => {
                            const typedStats =
                              stats as AssistantAggregatedStats;
                            const assistantName =
                              assistants.find((a) => a.id === assistantId)
                                ?.name ?? "Unknown Assistant";
                            return (
                              <TableRow
                                key={assistantId}
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedAssistantIdForModal(assistantId);
                                  fetchAssistantContacts(assistantId);
                                }}
                              >
                                <TableCell className="font-medium">
                                  {assistantName}
                                </TableCell>
                                <TableCell className="text-center">
                                  {typedStats.queued ?? 0}
                                </TableCell>
                                <TableCell className="text-center">
                                  {typedStats.initiated ?? 0}
                                </TableCell>
                                <TableCell className="text-center">
                                  {typedStats.completed ?? 0}
                                </TableCell>
                                <TableCell className="text-center">
                                  {typedStats.failed ?? 0}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">No data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Call Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Call Analysis</CardTitle>
                  <CardDescription>Quality metrics for calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Records
                      </p>
                      <p className="text-2xl font-bold">
                        {overView?.callDataStats?.totalCallRecords ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Short Calls
                      </p>
                      <p className="text-2xl font-bold">
                        {overView?.callDataStats?.shortCallsCount ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Long Calls
                      </p>
                      <p className="text-2xl font-bold">
                        {overView?.callDataStats?.longCallsCount ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Successful Analysis (with Voicemail)
                      </p>
                      <p className="text-2xl font-bold">
                        {overView?.callDataStats?.successfulAnalysisCount ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Successful Analysis (without Voicemail)
                      </p>
                      <p className="text-2xl font-bold">
                        {overView?.callDataStats
                          ?.successfulAnalysisWithoutVoicemailCount ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          {overView && !overviewLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Visual representation of call statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar
                  data={{
                    labels: [
                      "Total Records",
                      "Short Calls",
                      "Long Calls",
                      "Successful Analysis",
                    ],
                    datasets: [
                      {
                        label: "Call Statistics",
                        data: [
                          overView.callDataStats?.totalCallRecords ?? 0,
                          overView.callDataStats?.shortCallsCount ?? 0,
                          overView.callDataStats?.longCallsCount ?? 0,
                          overView.callDataStats?.successfulAnalysisCount ?? 0,
                        ],
                        backgroundColor: [
                          "rgba(53, 162, 235, 0.5)",
                          "rgba(255, 159, 64, 0.5)",
                          "rgba(75, 192, 192, 0.5)",
                          "rgba(52, 235, 116, 0.5)",
                        ],
                        borderColor: [
                          "rgb(53, 162, 235)",
                          "rgb(255, 159, 64)",
                          "rgb(75, 192, 192)",
                          "rgb(52, 235, 116)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" as const },
                      title: {
                        display: true,
                        text: "Call Analytics Overview",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Detailed Analysis</h2>

            <div className="flex items-center gap-4">
              {/* Analytics refresh */}
              <Button
                variant="outline"
                onClick={() => analyticsRefetch()}
                className="flex items-center gap-2"
              >
                {analyticsLoading ? "Refreshing..." : "Refresh Analytics"}
              </Button>

              {/* Export button */}
              <Button
                variant="outline"
                onClick={() => {
                  exportSuccessfulCallsToCSV(calls);
                }}
                disabled={!calls.length}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Successful Calls
              </Button>
            </div>
          </div>

          {analyticsLoading ? (
            <DetailedSkeleton />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Controls</CardTitle>
                    <CardDescription>
                      Customize your analytics view
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="successOnly"
                            checked={filters.successOnly}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                successOnly: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="successOnly"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Success Only
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="excludeVoicemail"
                            checked={filters.excludeVoicemail}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                excludeVoicemail: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="excludeVoicemail"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Exclude Voicemail
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="minDuration"
                            className="text-sm font-medium leading-none"
                          >
                            Minimum Duration (seconds)
                          </label>
                          <input
                            type="number"
                            id="minDuration"
                            value={filters.minDuration}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                minDuration: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="startDate"
                            className="text-sm font-medium leading-none"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={filters.startDate}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="endDate"
                            className="text-sm font-medium leading-none"
                          >
                            End Date
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            value={filters.endDate}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Successful Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {calls.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      {calls.length > 0
                        ? `${(
                          calls.reduce(
                            (acc, call) => acc + (call.durationSeconds ?? 0),
                            0
                          ) /
                          calls.length /
                          60
                        ).toFixed(1)} min`
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {chartData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Call Duration Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <Pie
                      data={chartData.durationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Successful Calls</CardTitle>
                  <CardDescription>
                    Calls that lasted over 30 seconds and were not sent to
                    voicemail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Assistant</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.length > 0 ? (
                        calls.map((call) => (
                          <TableRow
                            className="cursor-pointer"
                            key={call._id}
                            onClick={() => handleCardClick(call)}
                          >
                            <TableCell>
                              {call.customer?.number ?? "Unknown"}
                            </TableCell>
                            <TableCell>
                              {call.customer?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {call.durationSeconds !== undefined
                                ? `${Math.floor(
                                  call.durationSeconds / 60
                                )}m ${Math.floor(call.durationSeconds % 60)}s`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {call.assistant?.name ?? "Unknown"}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(call.startedAt as string),
                                "yyyy-MM-dd"
                              )}{" "}
                              (
                              {call.startedAt
                                ? formatDistanceToNow(
                                  new Date(call.startedAt),
                                  {
                                    addSuffix: true,
                                  }
                                )
                                : "Unknown"}
                              )
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No successful calls found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      {selectedCall && (
        <CallDetailModal call={selectedCall} onClose={closeModal} />
      )}

      <Dialog
        open={selectedAssistantIdForModal !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedAssistantIdForModal(null);
            setAssistantContacts(null);
            setSelectedContacts(new Set());
            setContactSearchTerm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Contacts for{" "}
                {assistants.find((a) => a.id === selectedAssistantIdForModal)
                  ?.name ?? "Unknown Assistant"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts by name or number..."
                value={contactSearchTerm}
                onChange={(e) => setContactSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <Tabs
              value={activeContactTab}
              onValueChange={setActiveContactTab}
              className="mt-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="queued">
                  Queued ({assistantContacts?.queued?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({assistantContacts?.completed?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Failed ({assistantContacts?.failed?.length || 0})
                </TabsTrigger>
              </TabsList>

              <div className="max-h-[400px] overflow-y-auto py-4">
                {assistantContacts === null ? (
                  <div className="text-center text-muted-foreground">
                    Loading contacts...
                  </div>
                ) : (
                  <>
                    <TabsContent value="queued" className="space-y-4">
                      {(() => {
                        const filteredContacts = filterContacts(
                          assistantContacts.queued || [],
                          contactSearchTerm
                        );
                        const allSelected =
                          filteredContacts.length > 0 &&
                          filteredContacts.every((contact) =>
                            selectedContacts.has(contact._id)
                          );

                        return (
                          <>
                            {filteredContacts.length > 0 && (
                              <div className="flex items-center justify-between mb-4 p-2 border-b">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="select-all-queued"
                                    checked={allSelected}
                                    onChange={(e) =>
                                      handleSelectAllContacts(
                                        filteredContacts,
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor="select-all-queued"
                                    className="text-sm font-medium"
                                  >
                                    Select All ({filteredContacts.length})
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      exportContactsToXLSX(
                                        filteredContacts,
                                        "Queued"
                                      )
                                    }
                                    disabled={selectedContacts.size === 0}
                                    className="flex items-center gap-1"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>
                                      Export (
                                      {
                                        Array.from(selectedContacts).filter(
                                          (id) =>
                                            filteredContacts.some(
                                              (c) => c._id === id
                                            )
                                        ).length
                                      }
                                      )
                                    </span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDeleteQueuedContacts}
                                    disabled={selectedContacts.size === 0}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                    <span>
                                      Delete (
                                      {
                                        Array.from(selectedContacts).filter(
                                          (id) =>
                                            filteredContacts.some(
                                              (c) => c._id === id
                                            )
                                        ).length
                                      }
                                      )
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            )}
                            {filteredContacts.length > 0 ? (
                              <div className="space-y-2">
                                {filteredContacts.map((contact) => (
                                  <div
                                    key={contact._id}
                                    className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedContacts.has(
                                        contact._id
                                      )}
                                      onChange={(e) =>
                                        handleSelectContact(
                                          contact._id,
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {contact.name || "Unnamed Contact"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {contact.number}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Created:{" "}
                                        {contact.createdAt
                                          ? new Date(
                                            contact.createdAt
                                          ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                {contactSearchTerm
                                  ? "No matching queued contacts."
                                  : "No queued contacts."}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                      {(() => {
                        const filteredContacts = filterContacts(
                          assistantContacts.completed || [],
                          contactSearchTerm
                        );
                        const allSelected =
                          filteredContacts.length > 0 &&
                          filteredContacts.every((contact) =>
                            selectedContacts.has(contact._id)
                          );

                        return (
                          <>
                            {filteredContacts.length > 0 && (
                              <div className="flex items-center justify-between mb-4 p-2 border-b">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="select-all-completed"
                                    checked={allSelected}
                                    onChange={(e) =>
                                      handleSelectAllContacts(
                                        filteredContacts,
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor="select-all-completed"
                                    className="text-sm font-medium"
                                  >
                                    Select All ({filteredContacts.length})
                                  </label>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    exportContactsToXLSX(
                                      filteredContacts,
                                      "Completed"
                                    )
                                  }
                                  disabled={selectedContacts.size === 0}
                                  className="flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Export Selected (
                                  {
                                    Array.from(selectedContacts).filter((id) =>
                                      filteredContacts.some((c) => c._id === id)
                                    ).length
                                  }
                                  )
                                </Button>
                              </div>
                            )}
                            {filteredContacts.length > 0 ? (
                              <div className="space-y-2">
                                {filteredContacts.map((contact) => (
                                  <div
                                    key={contact._id}
                                    className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedContacts.has(
                                        contact._id
                                      )}
                                      onChange={(e) =>
                                        handleSelectContact(
                                          contact._id,
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {contact.name || "Unnamed Contact"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {contact.number}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Created:{" "}
                                        {contact.createdAt
                                          ? new Date(
                                            contact.createdAt
                                          ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                {contactSearchTerm
                                  ? "No matching completed contacts."
                                  : "No completed contacts."}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="failed" className="space-y-4">
                      {(() => {
                        const filteredContacts = filterContacts(
                          assistantContacts.failed || [],
                          contactSearchTerm
                        );
                        const allSelected =
                          filteredContacts.length > 0 &&
                          filteredContacts.every((contact) =>
                            selectedContacts.has(contact._id)
                          );

                        return (
                          <>
                            {filteredContacts.length > 0 && (
                              <div className="flex items-center justify-between mb-4 p-2 border-b">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="select-all-failed"
                                    checked={allSelected}
                                    onChange={(e) =>
                                      handleSelectAllContacts(
                                        filteredContacts,
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor="select-all-failed"
                                    className="text-sm font-medium"
                                  >
                                    Select All ({filteredContacts.length})
                                  </label>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    exportContactsToXLSX(
                                      filteredContacts,
                                      "Failed"
                                    )
                                  }
                                  disabled={selectedContacts.size === 0}
                                  className="flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Export Selected (
                                  {
                                    Array.from(selectedContacts).filter((id) =>
                                      filteredContacts.some((c) => c._id === id)
                                    ).length
                                  }
                                  )
                                </Button>
                              </div>
                            )}
                            {filteredContacts.length > 0 ? (
                              <div className="space-y-2">
                                {filteredContacts.map((contact) => (
                                  <div
                                    key={contact._id}
                                    className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedContacts.has(
                                        contact._id
                                      )}
                                      onChange={(e) =>
                                        handleSelectContact(
                                          contact._id,
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {contact.name || "Unnamed Contact"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {contact.number}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Created:{" "}
                                        {contact.createdAt
                                          ? new Date(
                                            contact.createdAt
                                          ).toLocaleDateString()
                                          : "N/A"}
                                      </p>
                                      {contact.reason && (
                                        <p className="text-sm text-destructive">
                                          Reason: {contact.reason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8">
                                {contactSearchTerm
                                  ? "No matching failed contacts."
                                  : "No failed contacts."}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
