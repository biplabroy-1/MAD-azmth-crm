import type { Vapi } from "@vapi-ai/server-sdk";
import { CallData } from "./index";

export interface Customer {
  name: string;
  number: string;
}

export interface Assistant extends Vapi.Assistant {
  userId?: string;
  _id?: string;
}

export interface OverviewData {
  data: {
    _id: string;
    email: string;
    queueStats: {
      totalInQueue: number;
      totalInitiated: number;
      totalFailed: number;
      totalCompleted: number;
      successRate: number;
      assistantSpecific: {
        [assistantId: string]: AssistantAggregatedStats;
      };
    };
    callDataStats: {
      totalCallRecords: number;
      shortCallsCount: number;
      longCallsCount: number;
      successfulAnalysisCount: number;
      successfulAnalysisWithoutVoicemailCount: number;
    };
  };
}

export interface AssistantAggregatedStats {
  queued: number;
  initiated: number;
  failed: number;
  completed: number;
}

export interface AnalyticsData {
  data: CallData[];
}

/** ────── Subinterfaces ────── **/
export interface TwilioConfig {
  sid: string;
  authToken: string;
  phoneNumber: string;
}

export interface Contact {
  name: string;
  number: string;
  assistantId: string;
  status?: string;
}
export interface Contacts {
  _id: string;
  agentId: string;
  name: string;
  number: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface AssistantContacts {
  queued: Contacts[]
  completed: Contacts[]
  failed: Contacts[]
}

export interface ScheduleSlot {
  assistantId: string;
  assistantName: string;
  callTimeStart: string;
  callTimeEnd: string;
  callTimeStartET: string;
  callTimeEndET: string;
}

export interface DailySchedule {
  morning: ScheduleSlot;
  afternoon: ScheduleSlot;
  evening: ScheduleSlot;
}

export interface WeeklySchedule {
  sunday: DailySchedule;
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
}

export interface phoneNumber extends Vapi.TwilioPhoneNumber {
  userId?: string;
  _id: string
}

export type Schedule = Record<string, Record<string, ScheduleSlot>>;
