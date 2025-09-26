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

import { getTwilioConfig, saveTwilioConfig } from "@/app/actions/twilioActions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/dashboard/layout";

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

  const { toast } = useToast();

  // ✅ Twilio Config Query
  const {
    data,
    isPending: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ["twilioConfig"],
    queryFn: getTwilioConfig,
    staleTime: 1000 * 60 * 5, // Optional: cache for 5 minutes
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
      toast({
        title: "Success",
        description: "Twilio configuration loaded successfully",
      });
    }
  }, [data, toast]);

  useEffect(() => {
    if (configError) {
      toast({
        title: "Error",
        description: "Failed to fetch Twilio Config",
        variant: "destructive",
      });
    }
  }, [configError, toast]);

  // ✅ Save Mutation
  const {
    mutate: saveConfig,
    isPending: isSaving,
    error: saveError,
    isSuccess: isSaveSuccess,
  } = useMutation({
    mutationFn: saveTwilioConfig,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["twilioConfig"] });
    },
  });

  useEffect(() => {
    if (isSaveSuccess) {
      toast({
        title: "Success",
        description: "Twilio configuration saved successfully",
      });
      setOpen(false);
    }
  }, [isSaveSuccess, toast]);

  useEffect(() => {
    if (saveError) {
      toast({
        title: "Error",
        description: saveError?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [saveError, toast]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.sid || !formData.authToken || !formData.phoneNumber) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    saveConfig(formData);
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
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
