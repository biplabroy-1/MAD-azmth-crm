"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Plus,
  ChevronLeft,
  Phone,
  User,
  AlertCircle,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TwilioConfigModal from "@/components/TwilioConfig";
import CSVImporter, { Contact } from "@/components/CSVImporter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";

export default function CreateCall() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", number: "", hasCountryCode: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactsWithMissingCountryCode, setContactsWithMissingCountryCode] =
    useState<Contact[]>([]);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const { user } = useUser();
  const clerkId = user?.id
  const router = useRouter();
  const { toast } = useToast();

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
      setContacts(prevContacts => [...prevContacts, ...importedContacts]);

      toast({
        title: "Contacts added",
        description: `Added ${importedContacts.length} contacts from CSV import`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      return;
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
      return;
    }

    setIsSubmitting(true);

    try {
      // Format contacts for API
      const customersData = contacts.map((contact) => ({
        name: contact.name,
        number: contact.number,
      }));

      const response = await fetch("https://backend-queue.globaltfn.tech/queue-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId,
          contacts: customersData,
        }),
      });
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
      if (!response.ok) {
        throw new Error("Failed to create calls");
      }

      toast({
        title: "Success",
        description: `${data.message} with ${data.count} Customers` || "Calls have been initiated successfully",
      });

      // Navigate to call records page
      router.push("/call-records");
    } catch (error: any) {
      console.error("Error creating calls:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create calls. Please try again.",
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
                  {contactsWithMissingCountryCode.map((contact, index) => (
                    <li key={index}>
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
          <form onSubmit={handleSubmit}>
            <CardContent className="px-8 py-6 space-y-6">
              <div className="mb-6">
                {/* CSV Import Component */}
                <CSVImporter onImportContacts={handleImportContacts} />
              </div>

              <ScrollArea className="space-y-5c h-96 rounded-md border px-4">
                {contacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className={`p-6 border ${!contact.hasCountryCode && contact.number
                      ? "border-red-200"
                      : "border-gray-200"
                      } rounded-xl bg-white gap-4 relative transition-all hover:shadow-sm group my-4`}
                  >
                    <div className="absolute right-4 top-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="text-gray-400 hover:text-destructive rounded-full h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center mb-5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-medium mr-3">
                        <span className="text-sm">{index + 1}</span>
                      </div>
                      <h3 className="font-medium text-lg text-gray-800">
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`name-${contact.id}`}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id={`name-${contact.id}`}
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(contact.id, "name", e.target.value)
                          }
                          placeholder="John Doe"
                          className="focus-visible:ring-primary h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`number-${contact.id}`}
                          className={`flex items-center gap-2 ${!contact.hasCountryCode && contact.number
                            ? "text-red-500"
                            : "text-gray-700"
                            }`}
                        >
                          <Phone className="h-4 w-4" />
                          Phone Number (include country code)
                          {contact.number &&
                            (contact.hasCountryCode ? (
                              <Check className="h-4 w-4 text-green-500 ml-1" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500 ml-1" />
                            ))}
                        </Label>
                        <Input
                          id={`number-${contact.id}`}
                          value={contact.number}
                          onChange={(e) =>
                            updateContact(contact.id, "number", e.target.value)
                          }
                          placeholder="+1 (555) 123-4567"
                          className={`focus-visible:ring-primary h-11 ${!contact.hasCountryCode && contact.number
                            ? "border-red-300 focus:border-red-500"
                            : ""
                            }`}
                        />
                        {!contact.hasCountryCode && contact.number && (
                          <p className="text-xs text-red-500 mt-1">
                            Missing country code (e.g., +1, +44, +91)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
                disabled={isSubmitting}
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Initiating Calls...
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Start Calls
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
