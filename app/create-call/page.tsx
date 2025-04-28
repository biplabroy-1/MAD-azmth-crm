"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, ChevronLeft, Phone, User, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface Contact {
  id: string
  name: string
  number: string
}

export default function CreateCall() {
  const [contacts, setContacts] = useState<Contact[]>([{ id: "1", name: "", number: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string>("12:00")
  const [isScheduled, setIsScheduled] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const addContact = () => {
    setContacts([...contacts, { id: Date.now().toString(), name: "", number: "" }])
  }

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one contact",
        variant: "destructive",
      })
      return
    }
    setContacts(contacts.filter((contact) => contact.id !== id))
  }

  const updateContact = (id: string, field: "name" | "number", value: string) => {
    setContacts(contacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)))
  }

  const formatScheduledDateTime = () => {
    if (!scheduledDate) return null
    
    const date = format(scheduledDate, "MMM dd, yyyy")
    return `${date} at ${scheduledTime}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate contacts
    const invalidContacts = contacts.filter((contact) => !contact.name || !contact.number)

    if (invalidContacts.length > 0) {
      toast({
        title: "Validation Error",
        description: "All contacts must have a name and phone number",
        variant: "destructive",
      })
      return
    }

    // Validate scheduled date if enabled
    if (isScheduled && !scheduledDate) {
      toast({
        title: "Validation Error",
        description: "Please select a date for scheduled calls",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format contacts for API
      const customersData = contacts.map((contact) => ({
        name: contact.name,
        number: contact.number,
      }))

      // Prepare scheduling data if enabled
      let schedulingData = {}
      if (isScheduled && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number)
        const scheduledDateTime = new Date(scheduledDate)
        scheduledDateTime.setHours(hours, minutes, 0, 0)
        
        schedulingData = {
          scheduledTime: scheduledDateTime.toISOString()
        }
      }

      const AuthToken = process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN;
      const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
          phoneNumber: {
            twilioAccountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
            twilioPhoneNumber: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
            twilioAuthToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
          },
          customers: customersData,
          ...schedulingData
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create calls")
      }

      const data = await response.json()
      console.log("API Response:", data)

      toast({
        title: "Success",
        description: isScheduled 
          ? `Calls have been scheduled for ${formatScheduledDateTime()}`
          : "Calls have been initiated successfully",
      })

      // Navigate to call records page
      router.push("/call-records")
    } catch (error) {
      console.error("Error creating calls:", error)
      toast({
        title: "Error",
        description: "Failed to create calls. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
          </Badge>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="border-b border-gray-200 px-8 py-6">
            <CardTitle className="text-3xl font-semibold text-gray-900">
              Initiate New Calls
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Add contacts below to initiate voice calls through our system
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="px-8 py-6 space-y-6">
              {/* Scheduling Options */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-lg text-gray-800">Call Scheduling</h3>
                  </div>
                  <div className="flex items-center">
                    <Label htmlFor="scheduled-toggle" className="mr-3 text-sm text-gray-600">
                      Schedule for later
                    </Label>
                    <input
                      id="scheduled-toggle"
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="toggle-checkbox h-6 w-11 rounded-full bg-gray-300 cursor-pointer appearance-none transition-colors duration-200 ease-in-out relative checked:bg-blue-500 before:content-[''] before:absolute before:h-5 before:w-5 before:left-0.5 before:top-0.5 before:bg-white before:rounded-full before:shadow before:transition-transform before:duration-200 before:ease-in-out checked:before:translate-x-5"
                    />
                  </div>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-11 focus-visible:ring-primary"
                          >
                            {scheduledDate ? (
                              format(scheduledDate, "PPP")
                            ) : (
                              <span className="text-muted-foreground">Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-time" className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4" />
                        Time
                      </Label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="focus-visible:ring-primary h-11"
                      />
                    </div>
                  </div>
                )}
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
                      <h3 className="font-medium text-lg text-gray-800">Contact Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${contact.id}`} className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id={`name-${contact.id}`}
                          value={contact.name}
                          onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                          placeholder="John Doe"
                          className="focus-visible:ring-primary h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`number-${contact.id}`} className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id={`number-${contact.id}`}
                          value={contact.number}
                          onChange={(e) => updateContact(contact.id, "number", e.target.value)}
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isScheduled ? 'Scheduling Calls...' : 'Initiating Calls...'}
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    {isScheduled ? (
                      <>
                        <Calendar className="h-4 w-4" />
                        Schedule Calls
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        Start Calls
                      </>
                    )}
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}