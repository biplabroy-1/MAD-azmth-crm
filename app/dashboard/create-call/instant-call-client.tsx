"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Phone, Loader, AlertCircle } from "lucide-react";
import ContactCard from "@/components/ContactCard";
import type { Assistant } from "@/types/interfaces";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstantCallProps {
    queueOptions: Assistant[];
}

export default function InstantCall({ queueOptions }: InstantCallProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const clerkId = user?.id;

    const [contact, setContact] = useState({ id: "1", name: "", number: "", hasCountryCode: false });
    const [showWarning, setShowWarning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<string>("");
    const [queueModalOpen, setQueueModalOpen] = useState(false);


    const hasCountryCode = (number: string) => /^\+\d/.test(number.trim());

    const updateContact = (field: "name" | "number", value: string) => {
        setContact((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "number" ? { hasCountryCode: hasCountryCode(value) } : {}),
        }));
    };

    const validateContact = () => {
        if (!contact.name || !contact.number) {
            toast({
                title: "Validation Error",
                description: "Name and phone number are required.",
                variant: "destructive",
            });
            return false;
        }
        if (!hasCountryCode(contact.number)) {
            setShowWarning(true);
            toast({
                title: "Missing Country Code",
                description: "Phone number must include country code (e.g. +1).",
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateContact()) return;
        setIsSubmitting(true);
        try {
            // Replace with actual instant call API endpoint
            const res = await fetch(`/api/create-calls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assistantId: selectedQueue,
                    contact: { name: contact.name, number: contact.number },
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to start call.");
            toast({
                title: "Success",
                description: data.message || "Call started successfully.",
            });
            setContact({ id: "1", name: "", number: "", hasCountryCode: false });
        } catch (err) {
            toast({
                title: "Submission Failed",
                description: err instanceof Error ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-lg border">
            <CardHeader className="flex justify-between items-center border-b">
                <CardTitle className="text-2xl font-semibold">Instant Call</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 mt-4">
                    {showWarning && !contact.hasCountryCode && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Country Code Required</AlertTitle>
                            <AlertDescription>
                                Phone number must include country code (e.g. +1).
                            </AlertDescription>
                        </Alert>
                    )}
                    <ContactCard
                        contact={contact}
                        index={0}
                        updateContact={(id, field, value) => updateContact(field, value)}
                    />
                    <Select value={selectedQueue} onValueChange={setSelectedQueue}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a queue" />
                        </SelectTrigger>
                        <SelectContent>
                            {queueOptions.map((q) => (
                                <SelectItem key={q._id} value={q._id as string}>
                                    {q.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
                    <Button type="submit" className="w-full sm:w-auto h-11" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Calling…
                            </>
                        ) : (
                            <>
                                <Phone className="h-4 w-4 mr-2" /> Start Instant Call
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
