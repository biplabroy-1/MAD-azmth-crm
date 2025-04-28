"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Phone, Calendar, Clock, ArrowLeft, RefreshCw, Search } from "lucide-react"
import Link from "next/link"
import CallDetailModal from "@/components/call-detail-modal"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Customer {
  name: string
  number: string
}

interface CallRecord {
  id: string
  assistantId: string
  type: string
  startedAt: string
  endedAt: string
  transcript: string
  summary: string
  createdAt: string
  updatedAt: string
  status: string
  customer: Customer
  [key: string]: any
}

export default function CallRecords() {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<CallRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCallRecords()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredRecords(
        callRecords.filter(
          (record) =>
            record.customer?.number?.includes(searchTerm) ||
            record.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredRecords(callRecords)
    }
  }, [searchTerm, callRecords])

  const fetchCallRecords = async () => {
    const loadingState = callRecords.length > 0 ? setIsRefreshing : setIsLoading
    loadingState(true)
    
    try {
      const AuthToken = process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN;
      const response = await fetch("https://api.vapi.ai/call", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AuthToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch call records")
      }

      const data = await response.json()
      setCallRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error("Error fetching call records:", error)
      toast({
        title: "Error",
        description: "Failed to fetch call records. Please try again.",
        variant: "destructive",
      })
    } finally {
      loadingState(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "N/A"

    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const durationMs = end - start

    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes > 0 ? `${minutes}m ` : ''}${remainingSeconds}s`
  }

  const handleCardClick = (call: CallRecord) => {
    setSelectedCall(call)
  }

  const closeModal = () => {
    setSelectedCall(null)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      'ended': { color: 'bg-green-100 text-green-800', text: 'Completed' },
      'failed': { color: 'bg-red-100 text-red-800', text: 'Failed' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      'queued': { color: 'bg-yellow-100 text-yellow-800', text: 'Queued' },
      'initiated': { color: 'bg-purple-100 text-purple-800', text: 'Initiated' }
    }

    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Call Records</h1>
          <p className="text-muted-foreground mt-1">
            {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchCallRecords}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No call records found</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {searchTerm 
              ? "No records match your search criteria. Try a different search term."
              : "No call records available. Initiate calls to see records here."}
          </p>
          <Button onClick={fetchCallRecords}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh records
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((call) => (
            <Card
              key={call.id}
              className="transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group"
              onClick={() => handleCardClick(call)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">
                      {call.customer?.name || "Unknown Caller"}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {call.customer?.number || "N/A"}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusBadge(call.status).color}
                  >
                    {getStatusBadge(call.status).text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {formatDate(call.startedAt || call.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      Duration: {formatDuration(call.startedAt, call.endedAt)}
                    </span>
                  </div>
                  {call.summary && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {call.summary}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCall && <CallDetailModal call={selectedCall} onClose={closeModal} />}
    </div>
  )
}