"use client";

import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PhoneCall,
  ListOrdered,
  ChevronRight,
  LogIn,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
          Call Management System v1.0
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Supercharge Your{" "}
          <span className="text-primary">Outbound Calling</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Our platform empowers teams to initiate, track, and manage high-volume
          outbound calls with ease. Save time, increase conversions, and never
          miss a follow-up again.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Call Card */}
        <Card className="group hover:shadow-lg transition duration-300">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Create Calls</CardTitle>
                <CardDescription>
                  Bulk call creation with one click
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add a list of contacts with names and numbers. Initiate calls at
              scale with real-time monitoring and assistant support.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Bulk CSV uploads & validation</li>
              <li>• Multi-call session tracking</li>
              <li>• Smart assistant voice hand-off</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isSignedIn ? (
              <Link href="/create-call" className="w-full">
                <Button className="w-full group-hover:shadow-md">
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button className="w-full group-hover:shadow-md">
                  Sign In to Get Started
                  <LogIn className="h-4 w-4 ml-2" />
                </Button>
              </SignInButton>
            )}
          </CardFooter>
        </Card>

        {/* View Records Card */}
        <Card className="group hover:shadow-lg transition duration-300">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                <ListOrdered className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Call Records</CardTitle>
                <CardDescription>
                  Searchable & filterable call history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Instantly access past calls, playback recordings, and see detailed
              metadata for each session.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Full call transcripts & outcomes</li>
              <li>• Time-stamped analytics</li>
              <li>• Tagging & smart filters</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isSignedIn ? (
              <Link href="/call-records" className="w-full">
                <Button
                  variant="outline"
                  className="w-full group-hover:shadow-md"
                >
                  View Records
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="w-full group-hover:shadow-md"
                >
                  Sign In to View
                  <LogIn className="h-4 w-4 ml-2" />
                </Button>
              </SignInButton>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="border rounded-lg py-6 px-4">
          <div className="text-3xl font-bold text-primary">12K+</div>
          <div className="text-sm text-muted-foreground">Calls Initiated</div>
        </div>
        <div className="border rounded-lg py-6 px-4">
          <div className="text-3xl font-bold text-primary">98.7%</div>
          <div className="text-sm text-muted-foreground">Delivery Success</div>
        </div>
        <div className="border rounded-lg py-6 px-4">
          <div className="text-3xl font-bold text-primary">24/7</div>
          <div className="text-sm text-muted-foreground">Uptime</div>
        </div>
        <div className="border rounded-lg py-6 px-4">
          <div className="text-3xl font-bold text-primary">20+</div>
          <div className="text-sm text-muted-foreground">CRM Integrations</div>
        </div>
      </div>

      {/* Additional Feature Highlights (optional section) */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 border rounded-lg hover:shadow-md transition">
          <Settings className="mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Custom Call Flows</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated logic for how calls are handled, rerouted, or
            recorded.
          </p>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-md transition">
          <Users className="mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Team Collaboration</h3>
          <p className="text-sm text-muted-foreground">
            Share call records, assign tasks, and collaborate on follow-ups
            directly within the platform.
          </p>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-md transition">
          <BarChart3 className="mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Deep Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Visual dashboards for call performance, assistant effectiveness, and
            team metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
