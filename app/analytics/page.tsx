"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { format, formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import xlsx from "json-as-xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/nextjs";

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

interface AnalyticsCallRecord {
  _id: string;
  analysis?: {
    successEvaluation?: string;
    summary?: string;
  };
  startedAt?: string;
  endedReason?: string;
  durationSeconds?: number;
  call?: {
    id?: string;
    type?: string;
    phoneNumber?: string;
  };
  customer?: {
    name?: string;
    number?: string;
  };
  assistant?: {
    id?: string;
    name?: string;
  };
  transcript?: string;
  recordingUrl?: string;
}

interface OverviewData {
  data: {
    _id: string;
    email: string;
    queueStats: {
      totalInQueue: number;
      totalInitiated: number;
      totalFailed: number;
      totalCompleted: number;
      successRate: number;
      assistantSpecific: {
        [assistantId: string]: AssistantAggregatedStats;
      };
    };
    callDataStats: {
      totalCallRecords: number;
      shortCallsCount: number;
      longCallsCount: number;
      successfulAnalysisCount: number;
      successfulAnalysisWithoutVoicemailCount: number;
    };
  };
}

interface AssistantAggregatedStats {
  initiated: number;
  failed: number;
  completed: number;
}

interface AnalyticsData {
  data: AnalyticsCallRecord[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("detailed");
  const [filters, setFilters] = useState({
    successOnly: true,
    excludeVoicemail: true,
    minDuration: 30,
    startDate: "",
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [assistants, setAssistants] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const { userId } = useAuth();

  // Debounce filter changes to prevent too many API calls
  const debouncedFilters = useDebounce(filters, 1000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = new URLSearchParams({
          successOnly: debouncedFilters.successOnly.toString(),
          excludeVoicemail: debouncedFilters.excludeVoicemail.toString(),
          minDuration: debouncedFilters.minDuration.toString(),
          ...(debouncedFilters.startDate && {
            startDate: debouncedFilters.startDate,
          }),
          ...(debouncedFilters.endDate && {
            endDate: debouncedFilters.endDate,
          }),
        });

        // Fetch both analytics endpoints in parallel
        const [analyticsResponse, overviewResponse] = await Promise.all([
          fetch(`/api/get-analytics?${queryParams.toString()}`),
          fetch("/api/overview"),
        ]);

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        if (!overviewResponse.ok) {
          throw new Error("Failed to fetch overview data");
        }

        const analyticsResult: AnalyticsData = await analyticsResponse.json();
        const overviewResult: OverviewData = await overviewResponse.json();

        setAnalyticsData(analyticsResult);
        setOverviewData(overviewResult);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedFilters]); // Use debounced filters instead of raw filters

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch("/api/get-assistants");
        if (!response.ok) {
          throw new Error("Failed to fetch assistants");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.assistants)) {
          // Format assistants as queue options
          const formattedAssistants = data.assistants.map((assistant: any) => ({
            id: assistant.id,
            name: assistant.name || `Assistant ${assistant.id.slice(0, 6)}`,
          }));

          setAssistants(formattedAssistants);
        } else {
          console.error("Invalid assistants data format", data);
        }
      } catch (error) {
        console.error("Error fetching assistants:", error);
        toast({
          title: "Error",
          description: "Failed to load assistants. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchAssistants();
  }, []);

  // Add useDebounce hook at the top of the file, after imports
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData?.data) return null;

    const calls = analyticsData.data;

    // For duration distribution
    const durationRanges: Record<string, number> = {
      "30-60s": 0,
      "1-2m": 0,
      "2-5m": 0,
      "5m+": 0,
    };

    calls.forEach((call) => {
      const duration = call.durationSeconds ?? 0;
      if (duration > 0 && duration <= 60) durationRanges["30-60s"]++;
      else if (duration > 60 && duration <= 120) durationRanges["1-2m"]++;
      else if (duration > 120 && duration <= 300) durationRanges["2-5m"]++;
      else if (duration > 300) durationRanges["5m+"]++;
    });

    return {
      durationData: {
        labels: Object.keys(durationRanges),
        datasets: [
          {
            label: "Call Duration Distribution",
            data: Object.values(durationRanges),
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 206, 86, 0.6)",
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const chartData = prepareChartData();

  const calls: AnalyticsCallRecord[] = analyticsData?.data || [];
  const overview = overviewData?.data;
  const assistantSpecificData = overview?.queueStats.assistantSpecific || {};

  const exportSuccessfulCallsToCSV = () => {
    if (!calls.length) return;

    const data = [
      {
        sheet: "Successful Calls",
        columns: [
          { label: "Phone Number", value: "phoneNumber" },
          { label: "Customer Name", value: "customerName" },
          { label: "Customer Number", value: "customerNumber" },
          { label: "Duration", value: "duration" },
          { label: "Assistant", value: "assistant" },
          { label: "Started At", value: "startedAt" },
          { label: "Ended Reason", value: "endedReason" },
          { label: "Success Evaluation", value: "successEvaluation" },
          { label: "Recording URL", value: "recordingUrl" },
          { label: "Analysis Summary", value: "analysisSummary" },
          { label: "Transcript", value: "transcript" },
        ],
        content: calls.map((call) => ({
          phoneNumber: call.call?.phoneNumber ?? "Unknown",
          customerName: call.customer?.name ?? "Unknown",
          customerNumber: call.customer?.number ?? "Unknown",
          duration: call.durationSeconds !== undefined
            ? `${Math.floor(call.durationSeconds / 60)}m ${(
                call.durationSeconds % 60
              ).toFixed(2)}s`
            : "N/A",
          assistant: call.assistant?.name ?? "Unknown",
          startedAt: call.startedAt
            ? new Date(call.startedAt).toLocaleString()
            : "Unknown",
          endedReason: call.endedReason ?? "N/A",
          successEvaluation: call.analysis?.successEvaluation ?? "N/A",
          recordingUrl: call.recordingUrl ?? "N/A",
          analysisSummary: call.analysis?.summary ?? "N/A",
          transcript: call.transcript ?? "N/A",
        })),
      },
    ];

    const settings = {
      fileName: "SuccessfulCalls Last "+ filters.endDate,
      extraLength: 0,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    xlsx(data, settings);
  };

  function startQueue() {
    fetch("https://backend-queue.globaltfn.tech/api/start-queue", {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Analytics...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-500">
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Call Analytics</h1>
        <Button onClick={startQueue}>Start Queue</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Stats</CardTitle>
                <CardDescription>
                  Current call processing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      In Queue
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.queueStats.totalInQueue || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Initiated
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.queueStats.totalInitiated || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.queueStats.totalCompleted || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Failed
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {overview?.queueStats.totalFailed || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {(overview?.queueStats.successRate || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Queue Stats Per Assistent</CardTitle>
                <CardDescription>
                  Current call processing status per Assistent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overview?.queueStats.assistantSpecific && (
                  <div className="mt-4">
                    <div className="max-h-[300px] overflow-auto">
                      {/* Updated Grid Columns: Removed 'In Queue' column */}
                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-gray-200 pb-2 mb-2 text-sm font-medium text-gray-500">
                        <div>Name</div>
                        {/* Removed: <div className="text-center">In Queue</div> */}
                        <div className="text-center">Initiated</div> {/* Moved initiated */}
                        <div className="text-center">Done</div>
                        <div className="text-center">Failed</div>
                      </div>

                      {Object.entries(assistantSpecificData).map(([assistantId, stats]) => {
                        // Now 'stats' directly contains initiated, completed, failed
                        const initiated = stats.initiated || 0;
                        const completed = stats.completed || 0;
                        const failed = stats.failed || 0;

                        // Find assistant name using assistantId
                        const assistantName =
                          assistants.find((ass) => ass.id === assistantId)?.name || 'Unknown Assistant';

                        return (
                          <div
                            key={assistantId} // Use assistantId as key
                            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center text-gray-800 border-b border-gray-100 py-2"
                          >
                            <div className="font-medium">
                              {assistantName}
                            </div>

                            {/* Display Initiated */}
                            <div>
                              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {initiated}
                              </span>
                            </div>

                            {/* Display Done (Completed) */}
                            <div>
                              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {completed}
                              </span>
                            </div>

                            {/* Display Failed */}
                            <div>
                              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {failed}
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Call Analysis</CardTitle>
                <CardDescription>Quality metrics for calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Records
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats.totalCallRecords || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Short Calls
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats.shortCallsCount || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Long Calls
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats.longCallsCount || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Successful Analysis Count with Voicemail
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats.successfulAnalysisCount || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Successful Analysis Count without Voicemail
                    </p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats
                        .successfulAnalysisWithoutVoicemailCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {overview && (
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
                          overview.callDataStats.totalCallRecords,
                          overview.callDataStats.shortCallsCount,
                          overview.callDataStats.longCallsCount,
                          overview.callDataStats.successfulAnalysisCount,
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
                      legend: {
                        position: "top" as const,
                      },
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
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detailed Analysis</h2>
              <Button
                variant="outline"
                onClick={exportSuccessfulCallsToCSV}
                disabled={!calls.length}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Successful Calls
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filter Controls</CardTitle>
                <CardDescription>Customize your analytics view</CardDescription>
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
                <div className="text-4xl font-bold">{calls.length}</div>
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
                Calls that lasted over 30 seconds and were not sent to voicemail
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
                      <TableRow key={call._id}>
                        <TableCell>{call.customer?.number ?? "Unknown"}</TableCell>
                        <TableCell>
                          {call.customer?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {call.durationSeconds !== undefined
                            ? `${Math.floor(call.durationSeconds / 60)}m ${Math.floor(call.durationSeconds % 60)}s`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{call.assistant?.name ?? "Unknown"}</TableCell>
                        <TableCell>
                          {call.startedAt
                            ? formatDistanceToNow(new Date(call.startedAt), {
                                addSuffix: true,
                              })
                            : "Unknown"}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
