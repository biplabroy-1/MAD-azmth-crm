"use client";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Bar
} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CallRecord {
    id: string;
    assistantId: string;
    type: string;
    startedAt: string;
    endedAt: string;
    transcript: string;
    summary: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    customer: {
        name: string;
        number: string;
    };
    endedReason?: string;
    phoneCallProvider?: string;
    phoneCallProviderId?: string;
    phoneCallTransport?: string;
    phoneNumber?: {
        twilioPhoneNumber: string;
        twilioAccountSid: string;
    };
    [key: string]: any;
}

export default function Dashboard() {
    const [callRecords, setCallRecords] = useState<CallRecord[]>([]);

    useEffect(() => {
        fetchCallRecords();
    }, []);

    const fetchCallRecords = async () => {
        try {
            const response = await fetch("/api/call-records");
            if (!response.ok) throw new Error("Failed to fetch call records");
            const data = await response.json();
            setCallRecords(data);
        } catch (error) {
            console.error("Error fetching call records:", error);
        }
    };

    const getCallStatusData = () => {
        const statusCounts = callRecords.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(statusCounts),
            datasets: [
                {
                    label: "Call Status Distribution",
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                    ],
                    borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(153, 102, 255, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const totalCalls = callRecords.length;
    const completedCalls = callRecords.filter(r => r.status === "completed").length;
    const failedCalls = callRecords.filter(r => r.status === "failed").length;
    const inProgressCalls = callRecords.filter(r => r.status === "in-progress").length;

    const durations = callRecords.map(r => {
        const start = new Date(r.startedAt).getTime();
        const end = new Date(r.endedAt).getTime();
        return (end - start) / 1000; // seconds
    }).filter(d => !isNaN(d));

    const averageDuration = durations.length > 0
        ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
        : "N/A";
    const maxDuration = durations.length > 0 ? Math.max(...durations).toFixed(2) : "N/A";
    const minDuration = durations.length > 0 ? Math.min(...durations).toFixed(2) : "N/A";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader><CardTitle>Total Calls</CardTitle></CardHeader>
                    <CardContent>{totalCalls}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
                    <CardContent>{completedCalls}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Failed</CardTitle></CardHeader>
                    <CardContent>{failedCalls}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>In Progress</CardTitle></CardHeader>
                    <CardContent>{inProgressCalls}</CardContent>
                </Card>
            </div>

            {/* Call Duration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader><CardTitle>Avg. Duration (s)</CardTitle></CardHeader>
                    <CardContent>{averageDuration}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Longest Call (s)</CardTitle></CardHeader>
                    <CardContent>{maxDuration}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Shortest Call (s)</CardTitle></CardHeader>
                    <CardContent>{minDuration}</CardContent>
                </Card>
            </div>

            {/* Status Chart */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Call Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar
                        data={getCallStatusData()}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: "top" },
                                title: { display: true, text: "Call Status Distribution" },
                            },
                        }}
                    />
                </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Calls</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                        {callRecords.slice(0, 10).map((call) => (
                            <li key={call.id} className="border-b pb-2">
                                <div className="font-medium">{call.customer.name} ({call.customer.number})</div>
                                <div className="text-sm text-gray-500">
                                    {call.status} - {new Date(call.startedAt).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
