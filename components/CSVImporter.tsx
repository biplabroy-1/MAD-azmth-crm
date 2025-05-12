"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface Contact {
  id: string;
  name: string;
  number: string;
  hasCountryCode: boolean;
}

interface CSVImporterProps {
  onImportContacts: (contacts: Contact[]) => void;
}

export default function CSVImporter({ onImportContacts }: CSVImporterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState<string | undefined>();
  const [numberColumn, setNumberColumn] = useState<string | undefined>();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [defaultCountryCode, setDefaultCountryCode] = useState("+1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Validate if a phone number has a country code
  const hasCountryCode = (number: string): boolean => {
    // Check if number starts with + followed by digits
    return /^\+\d/.test(number.trim());
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

  // Calculate pagination data
  useEffect(() => {
    if (csvData.length > 0) {
      setTotalPages(Math.ceil(csvData.length / itemsPerPage));
      // Reset to first page when data changes
      setCurrentPage(1);
    }
  }, [csvData, itemsPerPage]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return csvData
      .filter((row) => nameColumn && row[nameColumn] !== undefined)
      .slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
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

    // Get current page data for import - use the updated data with any country codes added
    const currentPageData = getCurrentPageData();

    // Import contacts from CSV
    const newContacts = currentPageData
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
        } else if (!hasCountryCode(number) && defaultCountryCode) {
          // Apply default country code if number doesn't have one and default is set
          const phoneNumber = number.replace(/[^0-9]/g, "");
          number = defaultCountryCode.startsWith("+")
            ? `${defaultCountryCode}${phoneNumber}`
            : `+${defaultCountryCode}${phoneNumber}`;
        }

        return {
          id:
            Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name,
          number,
          hasCountryCode: hasCountryCode(number),
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

    // Check for missing country codes
    const missing = newContacts.filter((contact) => !contact.hasCountryCode);

    // Call the parent component's callback with the imported contacts
    onImportContacts(newContacts);
    setIsDialogOpen(false);

    toast({
      title: "Import successful",
      description: `Imported ${newContacts.length} contacts from the CSV file (page ${currentPage} of ${totalPages})${
        missing.length > 0 ? ". Some contacts are still missing country codes." : ""
      }`,
      ...(missing.length > 0 ? { variant: "default" } : {}),
    });
    
    // If there are still contacts missing country codes, show a more detailed message
    if (missing.length > 0) {
      setTimeout(() => {
        toast({
          title: "Country Codes Required",
          description: `${missing.length} contacts still need country codes. These have been imported but may not work correctly without country codes.`,
          variant: "destructive",
        });
      }, 1000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* CSV Uploader UI */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-primary/5 rounded-lg border border-primary/10">
        <div className="shrink-0 p-3 bg-primary/10 rounded-full">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-medium text-gray-900">
            Import Contacts from CSV
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload a CSV file to import multiple contacts at once. Make sure
            phone numbers include country codes (e.g., +1).
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

      {/* CSV Import Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl w-full p-6 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
            <DialogDescription>
              Select which columns to use for contact names and phone numbers.
              Make sure phone numbers include country codes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 w-full overflow-y-auto">
            <Alert className="bg-amber-50 border-amber-200 py-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <AlertTitle className="text-amber-600 text-sm font-medium">Important</AlertTitle>
                <AlertDescription className="text-amber-700 text-xs">
                  Phone numbers must include a country code (e.g., +1 for US, +44 for UK). Numbers without country codes will be flagged.
                </AlertDescription>
              </div>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="default-country-code" className="text-sm font-medium text-blue-700 mb-1 block">
                    Default Country Code
                  </Label>
                  <div className="text-xs text-blue-600 mb-2">
                    Set a default country code to apply to all phone numbers missing one
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="default-country-code"
                    value={defaultCountryCode}
                    onChange={(e) => setDefaultCountryCode(e.target.value)}
                    placeholder="+1"
                    className="w-24 h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700"
                    onClick={() => {
                      // Apply the default country code to all numbers missing one
                      const updatedData = csvData.map(row => {
                        if (numberColumn && row[numberColumn] !== undefined) {
                          const number = String(row[numberColumn] || "").trim();
                          if (!hasCountryCode(number)) {
                            const phoneNumber = number.replace(/[^0-9]/g, "");
                            row[numberColumn] = defaultCountryCode.startsWith("+") 
                              ? `${defaultCountryCode}${phoneNumber}` 
                              : `+${defaultCountryCode}${phoneNumber}`;
                          }
                        }
                        return row;
                      });
                      setCsvData(updatedData);
                      toast({
                        title: "Country code applied",
                        description: `Applied ${defaultCountryCode} to all phone numbers missing country codes`,
                      });
                    }}
                  >
                    Apply to All
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
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
                Preview (First 4 rows)
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="items-per-page" className="text-sm">Items per page:</Label>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger id="items-per-page" className="w-[80px] h-8 text-sm">
                        <SelectValue placeholder="50" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-gray-500">
                    Showing page {currentPage} of {totalPages} ({(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, csvData.length)} of {csvData.length} contacts)
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden overflow-y-visible">
                  <div className="max-h-[260px]">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          {headers.map((header, index) => (
                            <TableHead
                              key={index}
                              className={`whitespace-nowrap min-w-[120px] ${
                                header === nameColumn || header === numberColumn
                                  ? "bg-primary/10 text-primary sticky left-0 z-20"
                                  : ""
                              }`}
                            >
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageData().slice(0, itemsPerPage).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {headers.map((header, colIndex) => (
                              <TableCell
                                key={colIndex}
                                className={`whitespace-nowrap min-w-[120px] ${
                                  header === numberColumn &&
                                  !hasCountryCode(String(row[header] || ""))
                                    ? "bg-red-50 text-red-600"
                                    : header === nameColumn ||
                                      header === numberColumn
                                    ? "bg-primary/5"
                                    : ""
                                }`}
                              >
                                {row[header] !== undefined
                                  ? String(row[header])
                                  : "-"}
                                {header === numberColumn &&
                                  row[header] !== undefined &&
                                  !hasCountryCode(String(row[header] || "")) && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      <span className="text-xs text-red-500">
                                        Missing country code
                                      </span>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Input 
                                          placeholder="+1" 
                                          className="h-6 w-20 text-xs min-w-[60px]" 
                                          onChange={(e) => {
                                            // Update the row data with the country code
                                            const countryCode = e.target.value;
                                            if (countryCode && row[header]) {
                                              const phoneNumber = String(row[header]).replace(/[^0-9]/g, "");
                                              row[header] = countryCode.startsWith("+") 
                                                ? `${countryCode}${phoneNumber}` 
                                                : `+${countryCode}${phoneNumber}`;
                                            }
                                          }}
                                        />
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-6 text-xs px-2 whitespace-nowrap"
                                          onClick={() => {
                                            // Force re-render to update the UI
                                            setCsvData([...csvData]);
                                          }}
                                        >
                                          Apply
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Total rows: {csvData.length}
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <span className="mx-1 text-xs">
                      {currentPage}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={importContacts}
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 min-w-[150px]"
              >
                Import Contacts
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
