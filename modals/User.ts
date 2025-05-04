import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    _id: string; // MongoDB ObjectId
    clerkId: string; // Clerk user ID
    email: string;
    phoneNumber: string;
    twilioConfig: {
        sid: string;
        authToken: string;
        phoneNumber: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        _id: { type: String, required: true }, // Use string for ObjectId
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String },
        lastName: { type: String },
        profileImageUrl: { type: String },
        phoneNumber: { type: String},
        twilioConfig: {
            sid: { type: String},
            authToken: { type: String},
            phoneNumber: { type: String},
        },
        assistantId: { type: String },
        
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;