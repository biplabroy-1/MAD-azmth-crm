import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  _id: string; // MongoDB ObjectId (as string)
  clerkId: string;
  email: string;
  phoneNumber: string;
  twilioConfig: {
    sid: string;
    authToken: string;
    phoneNumber: string;
  };
  content: string;
  callQueue: {
    name: string;
    number: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CallQueueSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    phoneNumber: { type: String },
    twilioConfig: {
      sid: { type: String },
      authToken: { type: String },
      phoneNumber: { type: String },
    },
    assistantId: { type: String },
    content: { type: String },
    callQueue: [CallQueueSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
