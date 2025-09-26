"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
    getPhoneNumbersList,
    createPhoneNumber,
    deletePhoneNumber,
} from "@/app/actions/phoneNumberActions";

type PhoneNumber = {
    _id: string;
    [key: string]: any;
};

const Page = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [form, setForm] = useState<PhoneNumber>({
        _id: "",
        assistantId: "",
        name: "",
        number: "",
        twilioAccountSid: "",
        twilioAuthToken: "",
    });

    const {
        data: phoneNumbers = [],
        isLoading,
        isPending,
        error,
        refetch,
    } = useQuery({
        queryKey: ["phoneNumbers"],
        queryFn: getPhoneNumbersList,
    });

    const createMutation = useMutation({
        mutationFn: createPhoneNumber,
        onSuccess: (response) => {
            if (!response.success) {
                // Show specific Vapi error if available
                console.log(response.error);

                toast({
                    title: "Error",
                    description:
                        typeof response.error === "string"
                            ? response.error
                            : "Failed to create phone number in Vapi",
                    variant: "destructive",
                });
                return;
            }

            toast({ title: "Phone number created" });
            queryClient.invalidateQueries({ queryKey: ["phoneNumbers"] });

            if (response.phoneNumber) {
                setSelectedNumber(response.phoneNumber);
            }

            setIsCreating(false);
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            toast({
                title: "Unexpected Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        },
    });


    const deleteMutation = useMutation({
        mutationFn: deletePhoneNumber,
        onSuccess: () => {
            toast({ title: "Deleted" });
            queryClient.invalidateQueries({ queryKey: ["phoneNumbers"] });
            setSelectedNumber(null);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete phone number",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setForm({
            _id: "",
            assistantId: "",
            name: "",
            number: "",
            twilioAccountSid: "",
            twilioAuthToken: "",
        });
    };

    const handleChange = (field: keyof PhoneNumber, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateNew = () => {
        resetForm();
        setIsCreating(true);
        setIsEditing(false);
        setSelectedNumber(null);
    };

    const handleEditNumber = () => {
        if (!selectedNumber) return;
        setForm(selectedNumber);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(form);
        if (errors.length > 0) {
            toast({
                title: "Validation Error",
                description: errors.join(", "),
                variant: "destructive",
            });
            return;
        }
        const { assistantId, name, number, twilioAccountSid, twilioAuthToken } = form;
        createMutation.mutate({ assistantId, name, number, twilioAccountSid, twilioAuthToken });
    };

    const handleDelete = () => {
        if (!selectedNumber) return;
        if (!window.confirm(`Delete ${selectedNumber.name}?`)) return;
        deleteMutation.mutate(selectedNumber._id); // use _id consistently
    };


    const renderForm = () => {
        const isSubmitting = createMutation.isPending;

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Assistant ID</Label>
                    <Input
                        value={form.assistantId}
                        onChange={(e) => handleChange("assistantId", e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label>Phone Number Name</Label>
                    <Input
                        placeholder="e.g. Support Line"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label>Phone Number</Label>
                    <Input
                        placeholder="e.g. +14155552671"
                        value={form.number}
                        onChange={(e) => handleChange("number", e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label>Twilio Account SID</Label>
                    <Input
                        value={form.twilioAccountSid}
                        onChange={(e) => handleChange("twilioAccountSid", e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <Label>Twilio Auth Token</Label>
                    <Input
                        type="password"
                        value={form.twilioAuthToken}
                        onChange={(e) => handleChange("twilioAuthToken", e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Create Phone Number"}
                </Button>
            </form>

        );
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>Failed to load phone numbers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => refetch()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r p-4 flex flex-col bg-card">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Phone Numbers</h2>
                        <Button size="sm" variant="outline" onClick={handleCreateNew}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        {/* Refresh Button */}
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                            {/* Refresh Icon */}
                            {isPending || isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : phoneNumbers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No phone numbers found</p>
                            <Button
                                variant="link"
                                onClick={handleCreateNew}
                                className="mt-2"
                            >
                                Add your first number
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {phoneNumbers.map((num: PhoneNumber) => (
                                <li key={num._id}>
                                    <Button
                                        variant={selectedNumber?._id === num._id ? "default" : "outline"}
                                        className="w-full justify-start text-left font-normal"
                                        onClick={() => {
                                            setSelectedNumber(num);
                                            setIsCreating(false);
                                            setIsEditing(false);
                                        }}
                                    >
                                        {num.name}
                                    </Button>
                                </li>
                            ))}
                        </ul>

                    )}
                </aside>

                {/* Main */}
                <main className="flex-1 p-6 overflow-auto">
                    {isCreating ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Phone Number</CardTitle>
                                <CardDescription>
                                    Link a Twilio number to an assistant
                                </CardDescription>
                            </CardHeader>
                            <CardContent>{renderForm()}</CardContent>
                        </Card>
                    ) : isEditing && selectedNumber ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Phone Number</CardTitle>
                                <CardDescription>Update your Twilio number</CardDescription>
                            </CardHeader>
                            <CardContent>{renderForm()}</CardContent>
                        </Card>
                    ) : selectedNumber ? (
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle>{selectedNumber.name}</CardTitle>
                                    <CardDescription>
                                        Number: {selectedNumber.number}
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={handleEditNumber}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 rounded-md bg-muted">
                                    Assistant ID: {selectedNumber.assistantId}
                                </div>
                                <div className="p-3 rounded-md bg-muted">
                                    Twilio SID: {selectedNumber.twilioAccountSid}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">No Number Selected</h3>
                                <p className="text-muted-foreground mb-4">
                                    Select a number from the sidebar or create a new one
                                </p>
                                <Button onClick={handleCreateNew}>Add New Number</Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Page;

function validateForm(form: PhoneNumber) {
    const errors: string[] = [];

    const e164Regex = /^\+[1-9]\d{1,14}$/;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!form.assistantId) {
        errors.push("Assistant ID is required");
    } else if (!uuidRegex.test(form.assistantId)) {
        errors.push("Assistant ID must be a valid UUID");
    }

    if (!form.name) {
        errors.push("Phone number name is required");
    }

    if (!form.number) {
        errors.push("Phone number is required");
    } else if (!e164Regex.test(form.number)) {
        errors.push("Phone number must be in E.164 format (e.g. +1234567890)");
    }

    if (!form.twilioAccountSid) {
        errors.push("Twilio Account SID is required");
    }

    if (!form.twilioAuthToken) {
        errors.push("Twilio Auth Token is required");
    }

    return errors;
}
