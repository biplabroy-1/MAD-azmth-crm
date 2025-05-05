"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TwilioConfigModal() {
  const [sid, setSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/twilio-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId && { "x-clerk-user-id": userId }),
        },
        body: JSON.stringify({ sid, authToken, phoneNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Twilio configuration");
      }

      toast({
        title: "Success",
        description: "Twilio configuration saved successfully",
      });

      router.push("/create-call");
    } catch (error) {
      console.error("Error saving Twilio configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save Twilio configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Twilio Configuration</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Twilio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sid" className="block text-sm font-medium">
              Twilio SID
            </label>
            <Input
              id="sid"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              placeholder="Enter Twilio SID"
              required
            />
          </div>
          <div>
            <label htmlFor="authToken" className="block text-sm font-medium">
              Twilio Auth Token
            </label>
            <Input
              id="authToken"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Enter Twilio Auth Token"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              Twilio Phone Number
            </label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter Twilio Phone Number"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}