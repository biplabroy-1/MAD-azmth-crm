"use client";

import { useState, useRef } from "react";
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
  Upload,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TwilioConfigModal from "@/components/TwilioConfig";

interface Contact {
  id: string;
  name: string;
  number: string;
}

export default function CreateCall() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", number: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState<string | undefined>();
  const [numberColumn, setNumberColumn] = useState<string | undefined>();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { toast } = useToast();

  const addContact = () => {
    setContacts([
      ...contacts,
      { id: Date.now().toString(), name: "", number: "" },
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
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          delimitersToGuess: [",", "\t", ";", "|"],
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              // Get headers from the first row and trim whitespace
              const headers = (results.meta.fields || [])
                .map((header) => header?.trim())
                .filter((header) => header && header !== "");

              setHeaders(headers);

              // Clean up data to handle whitespace issues
              const dataRows = (results.data as any[]).map((row) => {
                const cleanRow: any = {};
                headers.forEach((header) => {
                  if (header && row[header] !== undefined) {
                    cleanRow[header] = row[header];
                  } else {
                    // Try to find the header with whitespace issues
                    const originalHeader = results.meta.fields?.find(
                      (h) => h?.trim() === header
                    );
                    if (originalHeader && row[originalHeader] !== undefined) {
                      cleanRow[header] = row[originalHeader];
                    }
                  }
                });
                return cleanRow;
              });

              setCsvData(dataRows);
              setPreviewData(dataRows.slice(0, 5)); // Show first 5 rows for preview

              // Try to automatically find name and phone columns
              const nameColumnIndex = headers.findIndex(
                (header) =>
                  header.toLowerCase().includes("name") ||
                  header.toLowerCase().includes("contact")
              );

              const phoneColumnIndex = headers.findIndex(
                (header) =>
                  header.toLowerCase().includes("phone") ||
                  header.toLowerCase().includes("mobile") ||
                  header.toLowerCase().includes("no.") ||
                  header.toLowerCase().includes("number") ||
                  header.toLowerCase().includes("cell")
              );

              if (nameColumnIndex !== -1) {
                setNameColumn(headers[nameColumnIndex]);
              }

              if (phoneColumnIndex !== -1) {
                setNumberColumn(headers[phoneColumnIndex]);
              }

              setIsDialogOpen(true);
            } else {
              toast({
                title: "Empty file",
                description: "The CSV file appears to be empty",
                variant: "destructive",
              });
            }
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            toast({
              title: "File error",
              description:
                "Could not parse the CSV file. Please check the format.",
              variant: "destructive",
            });
          },
        });
      } catch (error) {
        console.error("Error reading CSV file:", error);
        toast({
          title: "File error",
          description: "Could not read the file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "File error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const importContacts = () => {
    if (!nameColumn || !numberColumn) {
      toast({
        title: "Missing columns",
        description: "Please select both name and phone number columns",
        variant: "destructive",
      });
      return;
    }

    // Check if we have a country code column
    const countryCodeColumn = headers.find(
      (header) =>
        header.toLowerCase().includes("country") &&
        header.toLowerCase().includes("code")
    );

    // Import contacts from CSV
    const newContacts = csvData
      .filter((row) => row[nameColumn] !== undefined) // Filter out rows with missing name data
      .map((row) => {
        // Get the name value and trim any whitespace
        const name = String(row[nameColumn] || "").trim();

        // Handle phone number formatting
        let number = String(row[numberColumn] || "").trim();

        // If we have a country code column, try to format the number properly
        if (countryCodeColumn && row[countryCodeColumn] !== undefined) {
          const countryCode = String(row[countryCodeColumn] || "")
            .trim()
            .replace(/[^0-9+]/g, "");
          const phoneNumber = number.replace(/[^0-9]/g, "");

          // Format with proper "+" prefix if needed
          if (countryCode) {
            number = countryCode.startsWith("+")
              ? `${countryCode}${phoneNumber}`
              : `+${countryCode}${phoneNumber}`;
          }
        }

        return {
          id:
            Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name,
          number,
        };
      })
      .filter((contact) => contact.name && contact.number); // Ensure both name and number exist

    if (newContacts.length === 0) {
      toast({
        title: "No valid contacts",
        description: "The file doesn't contain any valid contacts",
        variant: "destructive",
      });
      return;
    }

    // Replace existing contacts with imported ones
    setContacts(newContacts);
    setIsDialogOpen(false);

    toast({
      title: "Import successful",
      description: `Imported ${newContacts.length} contacts from the CSV file`,
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

    setIsSubmitting(true);

    try {
      // Format contacts for API
      const customersData = contacts.map((contact) => ({
        name: contact.name,
        number: contact.number,
      }));

      const response = await fetch("/api/create-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts: customersData,
        }),
      });
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error("Failed to create calls");
      }

      console.log("API Response:", data);

      toast({
        title: "Success",
        description: "Calls have been initiated successfully",
      });

      // Navigate to call records page
      router.push("/call-records");
    } catch (error) {
      console.error("Error creating calls:", error);
      toast({
        title: "Error",
        description: "Failed to create calls. Please try again.",
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

        <Card className="shadow-xl border-0">
          <CardHeader className="border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-3xl font-semibold text-gray-900 mb-2">
              Initiate New Calls
            </CardTitle>
            <TwilioConfigModal />
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="px-8 py-6 space-y-6">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="shrink-0 p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-medium text-gray-900">
                      Import Contacts from CSV
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a CSV file to import multiple contacts at once
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload CSV
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {contacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="p-6 border border-gray-200 rounded-xl bg-white relative transition-all hover:shadow-sm group"
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
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id={`number-${contact.id}`}
                          value={contact.number}
                          onChange={(e) =>
                            updateContact(contact.id, "number", e.target.value)
                          }
                          placeholder="+1 (555) 123-4567"
                          className="focus-visible:ring-primary h-11"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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

      {/* CSV Import Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
            <DialogDescription>
              Select which columns to use for contact names and phone numbers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name-column" className="mb-2 block">
                  Name Column
                </Label>
                <Select value={nameColumn} onValueChange={setNameColumn}>
                  <SelectTrigger id="name-column">
                    <SelectValue placeholder="Select column for names" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number-column" className="mb-2 block">
                  Phone Number Column
                </Label>
                <Select value={numberColumn} onValueChange={setNumberColumn}>
                  <SelectTrigger id="number-column">
                    <SelectValue placeholder="Select column for phone numbers" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">
                Preview (First 5 rows)
              </h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableHead
                          key={index}
                          className={`${
                            header === nameColumn || header === numberColumn
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className={`${
                              header === nameColumn || header === numberColumn
                                ? "bg-primary/5"
                                : ""
                            }`}
                          >
                            {row[header] !== undefined
                              ? String(row[header])
                              : "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total rows: {csvData.length}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={importContacts}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              Import Contacts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
