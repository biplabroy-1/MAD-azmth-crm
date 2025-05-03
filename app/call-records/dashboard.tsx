import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

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
            const response = await fetch('/api/call-records', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch call records');
            }

            const data = await response.json();
            setCallRecords(data);
        } catch (error) {
            console.error('Error fetching call records:', error);
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
                    label: 'Call Status Distribution',
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Call Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar data={getCallStatusData()} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Call Status Distribution',
                            },
                        },
                    }} />
                </CardContent>
            </Card>
        </div>
    );
} 