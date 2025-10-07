"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Phone, Loader, AlertCircle } from "lucide-react";

import CSVImporter, { type Contact } from "@/components/CSVImporter";
import ContactCard from "@/components/ContactCard";
import type { Assistant } from "@/types/interfaces";

interface CreateCallProps {
  queueOptions: Assistant[];
}

// This file is now unused. Logic has been split into InstantCall and ScheduleCall components.