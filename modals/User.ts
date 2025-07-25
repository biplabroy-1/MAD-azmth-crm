import mongoose, { Schema, type Document } from "mongoose";
import type { DailySchedule, ScheduleSlot, TwilioConfig, WeeklySchedule } from "@/types/interfaces";

/** ────── Main User Interface ────── **/
export interface IUser extends Document {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;

  twilioConfig: TwilioConfig;
  assistantId: string;
  content: string;

  weeklySchedule?: WeeklySchedule;

  createdAt: Date;
  updatedAt: Date;
}

/** ────── Schema Definitions ────── **/

const ScheduleSlotSchema = new Schema<ScheduleSlot>(
  {
    assistantName: { type: String },
    assistantId: { type: String },
    callTimeStart: { type: String },
    callTimeEnd: { type: String },
    callTimeEndET: { type: String },
    callTimeStartET: { type: String }
  },
  { _id: false }
);

const DailyScheduleSchema = new Schema<DailySchedule>(
  {
    morning: { type: ScheduleSlotSchema },
    afternoon: { type: ScheduleSlotSchema },
    evening: { type: ScheduleSlotSchema }
  },
  { _id: false }
);

const WeeklyScheduleSchema = new Schema<WeeklySchedule>(
  {
    sunday: { type: DailyScheduleSchema },
    monday: { type: DailyScheduleSchema },
    tuesday: { type: DailyScheduleSchema },
    wednesday: { type: DailyScheduleSchema },
    thursday: { type: DailyScheduleSchema },
    friday: { type: DailyScheduleSchema },
    saturday: { type: DailyScheduleSchema }
  },
  { _id: false }
);

const TwilioConfigSchema = new Schema<TwilioConfig>(
  {
    sid: { type: String, required: true },
    authToken: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    profileImageUrl: String,

    twilioConfig: { type: TwilioConfigSchema },
    content: { type: String },

    weeklySchedule: { type: WeeklyScheduleSchema }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User