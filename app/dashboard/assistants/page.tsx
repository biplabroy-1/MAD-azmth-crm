"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    createAssistant,
    updateAssistant,
    deleteAssistant,
    getAssistantsList,
} from "@/app/actions/assistantActions";
import type { Assistant } from "@/types/interfaces";

const voiceProviders = [
    { value: "deepgram", label: "Deepgram" },
    { value: "vapi", label: "Default" }
];

const voiceModels = [
    { value: "aura-2", label: "Aura 2" },
    { value: "aura-1", label: "Aura 1" }
];

const voiceIds = [
    { value: "asteria", label: "Asteria (Female)" },
    { value: "callum", label: "Callum (Male)" },
    { value: "zeus", label: "Zeus (Male)" },
];

const Page = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [firstMessage, setFirstMessage] = useState("");
    const [endCallMessage, setEndCallMessage] = useState("");
    const [voiceProvider, setVoiceProvider] = useState("deepgram");
    const [voiceModel, setVoiceModel] = useState("aura-2");
    const [voiceId, setVoiceId] = useState("asteria");

    // Query for fetching assistants list
    const {
        data: assistantsData,
        isLoading,
        isPending,
        error,
        refetch
    } = useQuery({
        queryKey: ['assistants'],
        queryFn: async () => {
            const response = await getAssistantsList();
            return response.assistants || [];
        },
    });

    // Ensure assistants is always an array
    const assistants = Array.isArray(assistantsData) ? assistantsData : [];

    useEffect(() => {
        if (!selectedAssistant && assistants.length > 0 && !isCreating && !isEditing) {
            setSelectedAssistant(assistants[0]);
        }
    }, [assistants, selectedAssistant, isCreating, isEditing]);

    // Mutation for creating assistant
    const createMutation = useMutation({
        mutationFn: async (data: {
            name: string;
            systemPrompt: string;
            firstMessage: string;
            endCallMessage: string;
        }) => {
            const response = await createAssistant(
                data.name,
                data.systemPrompt,
                data.firstMessage,
                data.endCallMessage
            );
            if (!response.success) {
                throw new Error(response.error || 'Failed to create assistant');
            }
            return response.assistant;
        },
        onSuccess: (newAssistant) => {
            toast({
                title: "Success",
                description: "Assistant created successfully",
            });
            // Invalidate and refetch assistants
            queryClient.invalidateQueries({ queryKey: ['assistants'] });
            setSelectedAssistant(newAssistant);
            setIsCreating(false);
        },
        onError: (error) => {
            console.error("Error creating assistant:", error);
            toast({
                title: "Error",
                description: "Failed to create assistant",
                variant: "destructive",
            });
        }
    });

    // Mutation for updating assistant
    const updateMutation = useMutation({
        mutationFn: async (data: {
            id: string;
            updateData: {
                name: string;
                model: {
                    messages: Array<{
                        role: string;
                        content: string;
                    }>;
                };
                firstMessage: string;
                endCallMessage: string;
                voice: {
                    provider: string;
                    model: string;
                    voiceId: string;
                };
            };
        }) => {
            const response = await updateAssistant(data.id, data.updateData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to update assistant');
            }
            return response.assistant;
        },
        onSuccess: (updatedAssistant) => {
            toast({
                title: "Success",
                description: "Assistant updated successfully",
            });
            // Invalidate and refetch assistants
            queryClient.invalidateQueries({ queryKey: ['assistants'] });
            setSelectedAssistant(updatedAssistant || null);
            setIsEditing(false);
        },
        onError: (error) => {
            console.error("Error updating assistant:", error);
            toast({
                title: "Error",
                description: "Failed to update assistant",
                variant: "destructive",
            });
        }
    });

    // Mutation for deleting assistant
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await deleteAssistant(id);
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete assistant');
            }
            return id;
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Assistant deleted successfully",
            });
            // Invalidate and refetch assistants
            queryClient.invalidateQueries({ queryKey: ['assistants'] });
            // Select first assistant or null if none left
            const remainingAssistants = assistants.filter(a => (a.id || a._id) !== (selectedAssistant?.id || selectedAssistant?._id));
            setSelectedAssistant(remainingAssistants.length > 0 ? remainingAssistants[0] : null);
        },
        onError: (error) => {
            console.error("Error deleting assistant:", error);
            toast({
                title: "Error",
                description: "Failed to delete assistant",
                variant: "destructive",
            });
        }
    });

    const handleSelectAssistant = (assistant: Assistant) => {
        setSelectedAssistant(assistant);
        setIsEditing(false);
        setIsCreating(false);
    };

    const handleCreateNew = () => {
        setIsCreating(true);
        setIsEditing(false);
        setSelectedAssistant(null);
        resetForm();
    };

    const resetForm = () => {
        setName("");
        setSystemPrompt("");
        setFirstMessage("");
        setEndCallMessage("");
        setVoiceProvider("deepgram");
        setVoiceModel("aura-2");
        setVoiceId("asteria");
    };

    const handleEditAssistant = () => {
        if (!selectedAssistant) return;

        setName(selectedAssistant.name || "");
        setSystemPrompt(selectedAssistant.model?.messages?.[0]?.content || "");
        setFirstMessage(selectedAssistant.firstMessage || "");
        setEndCallMessage(selectedAssistant.endCallMessage || "");
        setVoiceProvider(selectedAssistant.voice?.provider || "deepgram");
        // @ts-ignore
        setVoiceModel(selectedAssistant.voice?.model || "aura-2");
        // @ts-ignore
        setVoiceId(selectedAssistant.voice?.voiceId || "asteria");

        setIsEditing(true);
        setIsCreating(false);
    };

    const handleSubmitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name || !systemPrompt || !firstMessage || !endCallMessage) {
            toast({
                title: "Validation Error",
                description: "All fields are required",
                variant: "destructive",
            });
            return;
        }

        createMutation.mutate({
            name,
            systemPrompt,
            firstMessage,
            endCallMessage
        });
    };

    const handleSubmitUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedAssistant || !name || !systemPrompt || !firstMessage || !endCallMessage) {
            toast({
                title: "Validation Error",
                description: "All fields are required",
                variant: "destructive",
            });
            return;
        }

        const updateData = {
            name,
            model: {
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
            },
            firstMessage,
            endCallMessage,
            voice: {
                provider: voiceProvider,
                model: voiceModel,
                voiceId: voiceId,
            },
        };

        updateMutation.mutate({
            id: selectedAssistant.id || selectedAssistant._id as string,
            updateData
        });
    };

    const handleDeleteAssistant = async () => {
        if (!selectedAssistant) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedAssistant.name}?`)) {
            return;
        }

        deleteMutation.mutate(selectedAssistant.id || selectedAssistant._id as string);
    };

    const renderForm = () => {
        const isUpdate = isEditing && selectedAssistant;
        const handleSubmit = isUpdate ? handleSubmitUpdate : handleSubmitCreate;
        const isSubmitting = createMutation.isPending || updateMutation.isPending;

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fields */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Assistant Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter assistant name"
                            className="mt-1"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="systemPrompt">System Prompt</Label>
                        <Textarea
                            id="systemPrompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Describe your assistant's purpose..."
                            className="mt-1 min-h-[120px]"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="firstMessage">First Message</Label>
                        <Textarea
                            id="firstMessage"
                            value={firstMessage}
                            onChange={(e) => setFirstMessage(e.target.value)}
                            placeholder="What should your assistant say first?"
                            className="mt-1"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <Label htmlFor="endCallMessage">End Call Message</Label>
                        <Textarea
                            id="endCallMessage"
                            value={endCallMessage}
                            onChange={(e) => setEndCallMessage(e.target.value)}
                            placeholder="What should your assistant say when ending a call?"
                            className="mt-1"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Voice */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="voiceProvider">Voice Provider</Label>
                            <Select
                                value={voiceProvider}
                                onValueChange={setVoiceProvider}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {voiceProviders.map((provider) => (
                                        <SelectItem key={provider.value} value={provider.value}>
                                            {provider.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="voiceModel">Voice Model</Label>
                            <Select
                                value={voiceModel}
                                onValueChange={setVoiceModel}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {voiceModels.map((model) => (
                                        <SelectItem key={model.value} value={model.value}>
                                            {model.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="voiceId">Voice</Label>
                            <Select
                                value={voiceId}
                                onValueChange={setVoiceId}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select voice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {voiceIds.map((voice) => (
                                        <SelectItem key={voice.value} value={voice.value}>
                                            {voice.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setIsCreating(false);
                            setIsEditing(false);
                            if (selectedAssistant) {
                                setSelectedAssistant(selectedAssistant);
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? (isUpdate ? "Updating..." : "Creating...")
                            : (isUpdate ? "Update Assistant" : "Create Assistant")
                        }
                    </Button>
                </div>
            </form>
        );
    };

    // Show error state if there's an error loading assistants
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>
                            Failed to load assistants
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => refetch()}>
                            Try Again
                        </Button>
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
                        <h2 className="text-lg font-semibold">Assistants</h2>
                        {/* Create Assistant Button */}
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
                    ) : assistants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No assistants found</p>
                            <Button
                                variant="link"
                                onClick={handleCreateNew}
                                className="mt-2"
                            >
                                Create your first assistant
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {assistants.map((assistant) => {
                                // Use _id as fallback for id
                                const assistantId = assistant.id || assistant._id;
                                const selectedId = selectedAssistant?.id || selectedAssistant?._id;

                                return (
                                    <li key={assistantId}>
                                        <Button
                                            variant={
                                                selectedId === assistantId
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="w-full justify-start text-left font-normal"
                                            onClick={() => handleSelectAssistant(assistant)}
                                            disabled={deleteMutation.isPending && selectedId === assistantId}
                                        >
                                            {assistant.name || "Unnamed Assistant"}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </aside>

                {/* Main */}
                <main className="flex-1 p-6 overflow-auto">
                    {isCreating ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Assistant</CardTitle>
                                <CardDescription>
                                    Configure your new AI voice assistant
                                </CardDescription>
                            </CardHeader>
                            <CardContent>{renderForm()}</CardContent>
                        </Card>
                    ) : isEditing && selectedAssistant ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Assistant</CardTitle>
                                <CardDescription>
                                    Update your AI voice assistant configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>{renderForm()}</CardContent>
                        </Card>
                    ) : selectedAssistant ? (
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle>
                                        {selectedAssistant.name || "Unnamed Assistant"}
                                    </CardTitle>
                                    <CardDescription>
                                        Assistant ID: {selectedAssistant._id || selectedAssistant.id}
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleEditAssistant}
                                        disabled={updateMutation.isPending}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDeleteAssistant}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium mb-2">System Prompt</h3>
                                    <div className="p-3 rounded-md bg-muted">
                                        {selectedAssistant.model?.messages?.[0]?.content ||
                                            "No system prompt set"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">First Message</h3>
                                        <div className="p-3 rounded-md bg-muted">
                                            {selectedAssistant.firstMessage ||
                                                "No first message set"}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium mb-2">
                                            End Call Message
                                        </h3>
                                        <div className="p-3 rounded-md bg-muted">
                                            {selectedAssistant.endCallMessage ||
                                                "No end call message set"}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium mb-2">
                                        Voice Configuration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 rounded-md bg-muted">
                                            <span className="text-xs text-muted-foreground block">
                                                Provider
                                            </span>
                                            {selectedAssistant.voice?.provider || "Not set"}
                                        </div>
                                        <div className="p-3 rounded-md bg-muted">
                                            <span className="text-xs text-muted-foreground block">
                                                Model
                                            </span>
                                            {/* @ts-ignore */}
                                            {selectedAssistant.voice?.model || "Not set"}
                                        </div>
                                        <div className="p-3 rounded-md bg-muted">
                                            <span className="text-xs text-muted-foreground block">
                                                Voice
                                            </span>
                                            {/* @ts-ignore */}
                                            {selectedAssistant.voice?.voiceId || "Not set"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">
                                    No Assistant Selected
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Select an assistant from the sidebar or create a new one
                                </p>
                                <Button onClick={handleCreateNew}>Create New Assistant</Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Page;