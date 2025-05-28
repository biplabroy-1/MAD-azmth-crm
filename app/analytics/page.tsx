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
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import xlsx from "json-as-xlsx";
import { Button } from "@/components/ui/button";

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
  analysis: {
    successEvaluation: string;
    // Add other analysis fields as needed
  };
  startedAt: string;
  endedReason: string;
  durationSeconds: number;
  call: {
    id: string;
    type: string;
    phoneNumber: string;
  };
  customer: {
    name: string;
    number: string;
  };
  assistant: {
    id: string;
    name: string;
  };
}

interface OverviewData {
  data: {
    email: string;
    queueStats: {
      totalInQueue: number;
      totalCompleted: number;
      totalFailed: number;
      successRate: number;
    };
    callDataStats: {
      totalCallRecords: number;
      shortCallsCount: number;
      successfulAnalysisCount: number;
      callsWithAnalysis: number;
    };
  };
}

interface AnalyticsData {
  data: Array<{
    matchingCalls: AnalyticsCallRecord[];
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both analytics endpoints in parallel
        const [analyticsResponse, overviewResponse] = await Promise.all([
          fetch("/api/get-analytics"),
          fetch("/api/overview")
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
  }, []);

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData?.data?.[0]?.matchingCalls) return null;

    const calls = analyticsData.data[0].matchingCalls;

    // For duration distribution
    const durationRanges = {
      "30-60s": 0,
      "1-2m": 0,
      "2-5m": 0,
      "5m+": 0,
    };

    calls.forEach((call) => {
      const duration = call.durationSeconds;
      if (duration <= 60) durationRanges["30-60s"]++;
      else if (duration <= 120) durationRanges["1-2m"]++;
      else if (duration <= 300) durationRanges["2-5m"]++;
      else durationRanges["5m+"]++;
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

  const exportSuccessfulCallsToCSV = () => {
    if (!calls.length) return;

    const data = [
      {
        sheet: "Successful Calls",
        columns: [
          { label: "Phone Number", value: "phoneNumber" },
          { label: "Customer Name", value: "customerName" },
          { label: "Duration", value: "duration" },
          { label: "Assistant", value: "assistant" },
          { label: "Started At", value: "startedAt" },
          { label: "Ended Reason", value: "endedReason" },
        ],
        content: calls.map((call) => ({
          phoneNumber: call.call.phoneNumber,
          customerName: call.customer?.name || "Unknown",
          duration: `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s`,
          assistant: call.assistant.name,
          startedAt: new Date(call.startedAt).toLocaleString(),
          endedReason: call.endedReason || "N/A",
        })),
      },
    ];

    const settings = {
      fileName: "SuccessfulCalls",
      extraLength: 3,
      writeMode: "writeFile",
      writeOptions: {},
      RTL: false,
    };

    xlsx(data, settings);
  };

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
            <CardTitle className="text-red-500">Error Loading Analytics</CardTitle>
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

  const calls = analyticsData?.data?.[0]?.matchingCalls || [];
  const overview = overviewData?.data;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Call Analytics</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Stats</CardTitle>
                <CardDescription>Current call processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">In Queue</p>
                    <p className="text-2xl font-bold">{overview?.queueStats.totalInQueue || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{overview?.queueStats.totalCompleted || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{overview?.queueStats.totalFailed || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-500">{(overview?.queueStats.successRate || 0).toFixed(1)}%</p>
                  </div>
                </div>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{overview?.callDataStats.totalCallRecords || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Short Calls</p>
                    <p className="text-2xl font-bold">{overview?.callDataStats.shortCallsCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Successful Analysis</p>
                    <p className="text-2xl font-bold">{overview?.callDataStats.successfulAnalysisCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Analysis Rate</p>
                    <p className="text-2xl font-bold">
                      {overview?.callDataStats.totalCallRecords
                        ? ((overview.callDataStats.callsWithAnalysis / overview.callDataStats.totalCallRecords) * 100).toFixed(1)
                        : 0}%
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
                <CardDescription>Visual representation of call statistics</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar
                  data={{
                    labels: ['Total Records', 'Short Calls', 'With Analysis', 'Successful Analysis'],
                    datasets: [{
                      label: 'Call Statistics',
                      data: [
                        overview.callDataStats.totalCallRecords,
                        overview.callDataStats.shortCallsCount,
                        overview.callDataStats.callsWithAnalysis,
                        overview.callDataStats.successfulAnalysisCount
                      ],
                      backgroundColor: [
                        'rgba(53, 162, 235, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(52, 235, 116, 0.5)',
                      ],
                      borderColor: [
                        'rgb(53, 162, 235)',
                        'rgb(255, 159, 64)',
                        'rgb(75, 192, 192)',
                        'rgb(52, 235, 116)',
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Call Analytics Overview'
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
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
                    ? `${(calls.reduce((acc, call) => acc + call.durationSeconds, 0) / calls.length / 60).toFixed(1)} min`
                    : "N/A"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">100%</div>
                <p className="text-muted-foreground">Filtered for successful calls only</p>
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
                      <TableRow key={call.call.id}>
                        <TableCell>{call.call.phoneNumber}</TableCell>
                        <TableCell>
                          {call.customer?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {Math.floor(call.durationSeconds / 60)}m{" "}
                          {call.durationSeconds % 60}s
                        </TableCell>
                        <TableCell>{call.assistant.name}</TableCell>
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
