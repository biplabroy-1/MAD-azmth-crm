"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader, AlertCircle, Calendar } from "lucide-react";
import CSVImporter, { type Contact } from "@/components/CSVImporter";
import ContactCard from "@/components/ContactCard";
import type { Assistant } from "@/types/interfaces";

interface ScheduleCallProps {
  queueOptions: Assistant[];
}

export default function ScheduleCall({ queueOptions }: ScheduleCallProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const clerkId = user?.id;

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", number: "", hasCountryCode: false },
  ]);
  const [contactsMissingCode, setContactsMissingCode] = useState<Contact[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCountryCode = (number: string) => /^\+\d/.test(number.trim());

  const addContact = () =>
    setContacts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", number: "", hasCountryCode: false },
    ]);

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      return toast({
        title: "Cannot remove",
        description: "You need at least one contact",
        variant: "destructive",
      });
    }
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const updateContact = (id: string, field: "name" | "number", value: string) =>
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: value,
              ...(field === "number" ? { hasCountryCode: hasCountryCode(value) } : {}),
            }
          : c
      )
    );

  const handleImportContacts = (imported: Contact[]) => {
    const missing = imported.filter((c) => !hasCountryCode(c.number));
    setContactsMissingCode(missing);
    setShowWarning(missing.length > 0);

    const isOnlyEmptyContact = contacts.length === 1 && !contacts[0].name && !contacts[0].number;
    const newContacts = isOnlyEmptyContact ? imported : [...contacts, ...imported];
    setContacts(newContacts);

    toast({
      title: "Contacts added",
      description: `Imported ${imported.length} contacts.`,
    });
  };

  const validateContacts = () => {
    const incomplete = contacts.filter((c) => !c.name || !c.number);
    if (incomplete.length) {
      toast({
        title: "Validation Error",
        description: "All contacts must have both name and phone number.",
        variant: "destructive",
      });
      return false;
    }
    const missing = contacts.filter((c) => !hasCountryCode(c.number));
    if (missing.length) {
      setContactsMissingCode(missing);
      setShowWarning(true);
      toast({
        title: "Missing Country Codes",
        description: `${missing.length} contact(s) missing country codes.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContacts()) {
      setQueueModalOpen(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedQueue) {
      return toast({
        title: "Queue Required",
        description: "Please select an assistant queue",
        variant: "destructive",
      });
    }
    setIsSubmitting(true);
    try {
      // Check if schedule exists for this queue (pseudo, replace with real check)
      const scheduleRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schedule/check?assistantId=${selectedQueue}`);
      const scheduleData = await scheduleRes.json();
      if (!scheduleData.exists) {
        toast({
          title: "No Schedule Found",
          description: "Please create a schedule for this assistant before scheduling calls.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setQueueModalOpen(false);
        return;
      }
      const customersData = contacts.map(({ name, number }) => ({ name, number }));
      const assistant = queueOptions.find((q) => q._id === selectedQueue);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/queue-calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId,
          contacts: customersData,
          assistantId: selectedQueue,
          assistantName: assistant?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to schedule calls.");
      }
      toast({
        title: "Success",
        description: data.message || "Calls have been scheduled successfully.",
      });
      setContacts([{ id: "1", name: "", number: "", hasCountryCode: false }]);
      setSelectedQueue("");
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setQueueModalOpen(false);
    }
  };

  return (
    <Card className="shadow-lg border">
      <CardHeader className="flex justify-between items-center border-b">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Schedule Calls
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleProceed}>
        <CardContent className="space-y-6 mt-4">
          <CSVImporter onImportContacts={handleImportContacts} />
          {showWarning && contactsMissingCode.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Country Codes Required</AlertTitle>
              <AlertDescription>
                {contactsMissingCode.length} contact(s) missing country codes (e.g. +1).
                {contactsMissingCode.length <= 5 && (
                  <ul className="list-disc pl-5 mt-2 text-sm">
                    {contactsMissingCode.map((c) => (
                      <li key={c.id}>
                        {c.name || "Unnamed"}: {c.number}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
          <ScrollArea className="h-96 rounded-md border p-4 space-y-4">
            {contacts.map((contact, i) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={i}
                updateContact={updateContact}
                removeContact={removeContact}
              />
            ))}
          </ScrollArea>
          <Button type="button" onClick={addContact} variant="outline" className="w-full h-12 border-dashed">
            <Plus className="h-5 w-5 mr-2" /> Add Contact
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
          <Button type="submit" className="w-full sm:w-auto h-11">
            <Calendar className="h-4 w-4 mr-2" /> Schedule Calls
          </Button>
        </CardFooter>
      </form>
      <Dialog open={queueModalOpen} onOpenChange={setQueueModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Assistant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose which assistant will handle these calls:
            </p>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQueueModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Scheduling…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
