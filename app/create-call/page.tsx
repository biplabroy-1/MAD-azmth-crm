"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ChevronLeft, Phone, AlertCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TwilioConfigModal from "@/components/TwilioConfig";
import CSVImporter, { type Contact } from "@/components/CSVImporter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import ContactCard from "@/components/ContactCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateCall() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", number: "", hasCountryCode: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactsWithMissingCountryCode, setContactsWithMissingCountryCode] =
    useState<Contact[]>([]);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState("");
  const { user } = useUser();
  const clerkId = user?.id;
  const router = useRouter();
  const { toast } = useToast();

  // Queue options from assistants
  const [queueOptions, setQueueOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Fetch assistants on component mount
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

          setQueueOptions(formattedAssistants);
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
  }, [toast]);

  // Validate if a phone number has a country code
  const hasCountryCode = (number: string): boolean => {
    // Check if number starts with + followed by digits
    return /^\+\d/.test(number.trim());
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        id: Date.now().toString(),
        name: "",
        number: "",
        hasCountryCode: false,
      },
    ]);
  };

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one contact",
        variant: "destructive",
      });
      return;
    }
    setContacts(contacts.filter((contact) => contact.id !== id));
  };

  const updateContact = (
    id: string,
    field: "name" | "number",
    value: string
  ) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              [field]: value,
              // Update hasCountryCode when modifying the number
              ...(field === "number"
                ? { hasCountryCode: hasCountryCode(value) }
                : {}),
            }
          : contact
      )
    );
  };

  const handleImportContacts = (importedContacts: Contact[]) => {
    // Check for missing country codes
    const missing = importedContacts.filter(
      (contact) => !contact.hasCountryCode
    );

    // Set missing country code contacts for display
    setContactsWithMissingCountryCode(missing);

    // Show validation warning if any contacts are missing country codes
    setShowValidationWarning(missing.length > 0);

    // Add imported contacts to existing ones or replace them
    if (contacts.length === 1 && !contacts[0].name && !contacts[0].number) {
      // If there's only one empty contact, replace it
      setContacts(importedContacts);
    } else {
      // Otherwise, append the imported contacts
      setContacts((prevContacts) => [...prevContacts, ...importedContacts]);

      toast({
        title: "Contacts added",
        description: `Added ${importedContacts.length} contacts from CSV import`,
      });
    }
  };

  const validateContacts = () => {
    // Validate contacts
    const invalidContacts = contacts.filter(
      (contact) => !contact.name || !contact.number
    );

    if (invalidContacts.length > 0) {
      toast({
        title: "Validation Error",
        description: "All contacts must have a name and phone number",
        variant: "destructive",
      });
      return false;
    }

    // Check for missing country codes
    const contactsMissingCountryCode = contacts.filter(
      (contact) => !hasCountryCode(contact.number)
    );

    if (contactsMissingCountryCode.length > 0) {
      toast({
        title: "Missing Country Codes",
        description: `${contactsMissingCountryCode.length} contacts are missing country codes. Please add country codes (e.g., +1) to all phone numbers.`,
        variant: "destructive",
      });
      setContactsWithMissingCountryCode(contactsMissingCountryCode);
      setShowValidationWarning(true);
      return false;
    }

    return true;
  };

  const handleProceedWithSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContacts()) {
      setQueueModalOpen(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedQueue) {
      toast({
        title: "Queue Required",
        description: "Please select an assistant queue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setQueueModalOpen(false);

    try {
      // Format contacts for API
      const customersData = contacts.map((contact) => ({
        name: contact.name,
        number: contact.number,
      }));

      const response = await fetch("https://backend-queue.globaltfn.tech/api/queue-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId,
          contacts: customersData,
          assistantId: selectedQueue, // Add the selected queue ID to the request
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
      if (!response.ok) {
        throw new Error("Failed to create calls");
      }

      toast({
        title: "Success",
        description:
          `${data.message}` || "Calls have been initiated successfully",
      });

    } catch (error: any) {
      console.error("Error creating calls:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create calls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="group flex items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Button>
          <Badge variant="secondary" className="px-3 py-1.5">
            {contacts.length} {contacts.length === 1 ? "Contact" : "Contacts"}
          </Badge>
        </div>

        {showValidationWarning && contactsWithMissingCountryCode.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Country Codes Required</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {contactsWithMissingCountryCode.length}{" "}
                {contactsWithMissingCountryCode.length === 1
                  ? "contact is"
                  : "contacts are"}{" "}
                missing country codes. Please add country codes (e.g., +1) to
                all phone numbers.
              </p>
              {contactsWithMissingCountryCode.length <= 5 && (
                <ul className="list-disc pl-5 text-sm">
                  {contactsWithMissingCountryCode.map((contact) => (
                    <li key={contact.id}>
                      {contact.name}: {contact.number}
                    </li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader className="border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-3xl font-semibold text-gray-900 mb-2 flex justify-between items-center">
              Initiate New Calls
              <TwilioConfigModal />
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleProceedWithSubmit}>
            <CardContent className="px-8 py-6 space-y-6">
              <div className="mb-6">
                {/* CSV Import Component */}
                <CSVImporter onImportContacts={handleImportContacts} />
              </div>

              <ScrollArea className="space-y-5c h-96 rounded-md border px-4">
                {contacts.map((contact, index) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    index={index}
                    updateContact={updateContact}
                    removeContact={removeContact}
                  />
                ))}
              </ScrollArea>

              <Button
                type="button"
                variant="outline"
                onClick={addContact}
                className="w-full border-dashed hover:bg-primary/5 h-12 text-gray-600 hover:text-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-medium">Add Another Contact</span>
              </Button>
            </CardContent>

            <CardFooter className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Start Calls
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Queue Selection Modal */}
      <Dialog open={queueModalOpen} onOpenChange={setQueueModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Assistant Queue</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please select which assistant queue should handle these calls:
            </p>
            <Select value={selectedQueue} onValueChange={setSelectedQueue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a queue" />
              </SelectTrigger>
              <SelectContent>
                {queueOptions.map((queue) => (
                  <SelectItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setQueueModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="animate-spin h-4 w-4" />
                  Adding to Queue
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
