"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";

interface TwilioConfigData {
  sid: string;
  authToken: string;
  phoneNumber: string;
}

export default function TwilioConfigModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TwilioConfigData>({
    sid: "",
    authToken: "",
    phoneNumber: "",
  });
  const [content, setContent] = useState("")

  const [isLoading, setIsLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTwilioConfig = async () => {
      if (user?.id && formData.sid === "") {
        setConfigLoading(true);
        try {
          const response = await fetch("/api/twilio-config", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-clerk-user-id": user.id,
            },
          });

          if (response.ok) {
            const { twilioConfig } = await response.json();

            setFormData({
              sid: twilioConfig.sid || "",
              authToken: twilioConfig.authToken || "",
              phoneNumber: twilioConfig.phoneNumber || "",
            });
            if (!twilioConfig) {
              toast({
                title: "Info",
                description: "Twilio Config not found",
              });
            } else {
              toast({
                title: "Success",
                description: "Twilio configuration loaded successfully",
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch Twilio config:", error);
          toast({
            title: "Error",
            description: "Failed to fetch Twilio Config",
            variant: "destructive",
          });
        } finally {
          setConfigLoading(false);
        }
      }
    };

    fetchTwilioConfig();
  }, [user?.id, formData.sid, toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    toast({
      title: "Info",
      description: "Updating configuration field...",
    });
  };

  const handleSubmit = async () => {
    if (!formData.sid || !formData.authToken || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      toast({
        title: "Loading",
        description: "Saving your Twilio configuration.",
      });

      const configRes = await fetch("/api/twilio-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user?.id || "",
        },
        body: JSON.stringify({
          sid: formData.sid,
          authToken: formData.authToken,
          phoneNumber: formData.phoneNumber,
          content
        }),
      });

      if (!configRes.ok) {
        const error = await configRes.json();
        throw new Error(error.message || "Failed to save configuration");
      }

      toast({
        title: "Loading",
        description: "Please wait while we set up your assistant.",
      });

      const assistantRes = await fetch("/api/create-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user?.id || "",
        },
      });

      if (!assistantRes.ok) {
        const error = await assistantRes.json();
        throw new Error(error.message || "Failed to create assistant");
      }

      const { id, message } = await assistantRes.json();
      if (!id) {
        throw new Error(message || "Assistant ID not found");
      }
      if (message === "Assistant already created") {
        toast({
          title: "Success",
          description: message || "Assistant has been successfully created.",
        });
        setOpen(false);
        return;
      }

      toast({
        title: "Loading",
        description: "Almost there! Configuring your number.",
      });

      const numberRes = await fetch("/api/create-number", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          sid: formData.sid,
          authToken: formData.authToken,
          phoneNumber: formData.phoneNumber,
          clerkId: user?.id,
        }),
      });

      if (!numberRes.ok) {
        const error = await numberRes.json();
        throw new Error(error.message || "Failed to create number");
      }
      const data = await numberRes.json();
      toast({
        title: "Success",
        description: data.message || "Your assistant is now ready to make calls.",
      });

      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Twilio Config</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Twilio Configuration</DialogTitle>
          <DialogDescription>
            Enter your Twilio credentials to enable calling functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sid" className="text-right">
              Account SID
            </Label>
            <Input
              id="sid"
              name="sid"
              disabled={configLoading}
              value={formData.sid}
              onChange={handleChange}
              className="col-span-3"
              placeholder="AC..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="authToken" className="text-right">
              Auth Token
            </Label>
            <Input
              id="authToken"
              name="authToken"
              type="password"
              disabled={configLoading}
              value={formData.authToken}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Enter auth token"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              disabled={configLoading}
              value={formData.phoneNumber}
              onChange={handleChange}
              className="col-span-3"
              placeholder="+1..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Personality
            </Label>
            <Textarea
              id="content"
              name="content"
              disabled={configLoading}
              value={content}
              onChange={(e)=>setContent(e.target.value)}
              className="col-span-3"
              placeholder="Give your assistant a personality"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
