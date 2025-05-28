'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, toZonedTime } from 'date-fns-tz'

interface TimeSlot {
    id: string;
    start: string;
    end: string;
}

interface Schedule {
    [key: string]: {
        [key: string]: {
            assistantName: string;
            assistantId: string;
            callTimeStart: string;
            callTimeEnd: string;
            utcTimeStart: string;
            utcTimeEnd: string;
        };
    };
}

const initialTimeSlots = [
    { id: 'morning', start: '09:00', end: '12:00' },
    { id: 'afternoon', start: '13:00', end: '16:00' },
    { id: 'evening', start: '17:00', end: '20:00' }
];

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const EDT_TIMEZONE = 'America/New_York';
const UTC_TIMEZONE = 'UTC';
const IST_TIMEZONE = 'Asia/Kolkata'

export default function SchedulePage() {
    const { userId } = useAuth();
    const [assistants, setAssistants] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<Schedule>({});
    const [status, setStatus] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const convertToUTC = (time: string, day: string) => {
        const today = new Date();
        const dayIndex = days.indexOf(day);
        const currentDayIndex = today.getDay();
        const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;

        const dateStr = new Date(today.setDate(today.getDate() + daysToAdd));
        const [hours, minutes] = time.split(':');
        dateStr.setHours(Number.parseInt(hours), Number.parseInt(minutes));

        const edtTime = toZonedTime(dateStr, EDT_TIMEZONE);
        const utcTime = toZonedTime(edtTime, UTC_TIMEZONE);
        const IstTime = toZonedTime(edtTime, IST_TIMEZONE);
        console.log(format(IstTime, 'HH:mm'));


        return format(utcTime, 'HH:mm');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // const assistantsResponse = await fetch("https://api.vapi.ai/assistant", {
                //     method: "GET",
                //     headers: {
                //         "Authorization": "Bearer 3ea388a6-8480-475f-8f76-59ebe5607ecb"
                //     },
                // });

                // if (!assistantsResponse.ok) {
                //     throw new Error('Failed to fetch assistants');
                // }

                // const assistantsData = await assistantsResponse.json();
                // setAssistants(assistantsData);

                if (userId) {
                    const scheduleResponse = await fetch(`http://localhost:5000/api/schedule/${userId}`);
                    if (scheduleResponse.ok) {
                        const scheduleData = await scheduleResponse.json();
                        setSchedule(scheduleData.weeklySchedule || {});
                        return;
                    }
                }

                const initSchedule: Schedule = {};
                days.forEach((day) => {
                    initSchedule[day] = {};
                    timeSlots.forEach((slot) => {
                        initSchedule[day][slot.id] = {
                            assistantName: '',
                            assistantId: '',
                            callTimeStart: slot.start,
                            callTimeEnd: slot.end,
                            utcTimeStart: convertToUTC(slot.start, day),
                            utcTimeEnd: convertToUTC(slot.end, day)
                        };
                    });
                });
                setSchedule(initSchedule);

            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, timeSlots]);

    const handleTimeChange = (day: string, slotId: string, type: 'start' | 'end', event: React.ChangeEvent<HTMLInputElement>) => {
        const time = event.target.value;
        const utcTime = convertToUTC(time, day);

        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slotId]: {
                    ...prev[day][slotId],
                    [type === 'start' ? 'callTimeStart' : 'callTimeEnd']: time,
                    [type === 'start' ? 'utcTimeStart' : 'utcTimeEnd']: utcTime
                }
            }
        }));
    };

    const handleSelect = (day: string, slot: string, assistantId: string) => {
        const assistant = assistants.find((a) => a.id === assistantId);
        const timeSlot = timeSlots.find((t) => t.id === slot);

        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [slot]: {
                    assistantName: assistant?.name || '',
                    assistantId: assistant?.id || '',
                    callTimeStart: timeSlot?.start || '',
                    callTimeEnd: timeSlot?.end || '',
                    utcTimeStart: convertToUTC(timeSlot?.start || '', day),
                    utcTimeEnd: convertToUTC(timeSlot?.end || '', day)
                }
            }
        }));
    };

    const handleSubmit = async () => {
        if (!userId) {
            setStatus('User not authenticated');
            return;
        }

        setLoading(true);
        setStatus('');
        try {
            const res = await fetch('http://localhost:5000/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weeklySchedule: schedule,
                    clerkId: userId
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to submit schedule');
            }

            setStatus('Schedule submitted successfully!');
        } catch (err) {
            console.error(err);
            setStatus('Error occurred while submitting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold mb-4">Set Weekly Assistant Schedule (EDT)</h1>
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
                                            value={schedule[day]?.[slot.id]?.assistantId || ''}
                                            onValueChange={(value) => handleSelect(day, slot.id, value)}
                                        >
                                            <SelectTrigger className='max-w-96'>
                                                <SelectValue placeholder="Select Assistant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assistants.map((a) => (
                                                    <SelectItem key={a.id} value={a.id}>
                                                        {a.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="time"
                                                value={schedule[day]?.[slot.id]?.callTimeStart}
                                                onChange={(e) => handleTimeChange(day, slot.id, 'start', e)}
                                                className="border rounded p-1"
                                            />
                                            <span>to</span>
                                            <input
                                                type="time"
                                                value={schedule[day]?.[slot.id]?.callTimeEnd}
                                                onChange={(e) => handleTimeChange(day, slot.id, 'end', e)}
                                                className="border rounded p-1"
                                            />
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            UTC: {schedule[day]?.[slot.id]?.utcTimeStart} - {schedule[day]?.[slot.id]?.utcTimeEnd}
                                        </div>
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Button
                onClick={handleSubmit}
                className="mt-4"
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit Schedule'}
            </Button>

            {status && (
                <p className={`mt-4 ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {status}
                </p>
            )}
        </main>
    );
}
