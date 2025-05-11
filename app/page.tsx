
"use client"
import Link from "next/link"
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, PhoneCall, ListOrdered, ChevronRight, LogIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const { isSignedIn } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium">
            Call Management System v1.0
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Streamline Your <span className="text-primary">Outbound Calls</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Efficiently manage and track your outbound calls with our intuitive dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Create New Calls</CardTitle>
                  <CardDescription>Initiate multiple calls in one go</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add multiple contacts with their names and phone numbers to initiate calls.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Bulk contact upload
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Real-time call initiation
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Interactive call management
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {isSignedIn ? (
                <Link href="/create-call" className="w-full">
                  <Button className="w-full group-hover:shadow-md transition-all">
                    Get Started
                    <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <div className="w-full">
                  <SignInButton mode="modal">
                    <Button className="w-full group-hover:shadow-md transition-all">
                      Sign In to Get Started
                      <LogIn className="h-4 w-4 ml-2" />
                    </Button>
                  </SignInButton>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <ListOrdered className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">View Call Records</CardTitle>
                  <CardDescription>Track and analyze call history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View all call records, search by phone number, and see detailed information for each call.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  Comprehensive call logs
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  Advanced search filters
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  Call analytics
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {isSignedIn ? (
                <Link href="/call-records" className="w-full">
                  <Button variant="outline" className="w-full group-hover:shadow-md transition-all">
                    View Records
                    <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <div className="w-full">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full group-hover:shadow-md transition-all">
                      Sign In to View
                      <LogIn className="h-4 w-4 ml-2" />
                    </Button>
                  </SignInButton>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Calls Processed</div>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Availability</div>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">99%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Integrations</div>
          </div>
        </div>
      </div>
    </div>
  )
}