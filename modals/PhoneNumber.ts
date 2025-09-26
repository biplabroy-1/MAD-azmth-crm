import { phoneNumber } from "@/types/interfaces";
import mongoose from "mongoose";

const PhoneNumberSchema = new mongoose.Schema<phoneNumber>({
    userId: { type: String, required: true },
    _id: { type: String, required: true },
}, { strict: false, timestamps: true });

const PhoneNumberModel = mongoose.models.PhoneNumber || mongoose.model("PhoneNumber", PhoneNumberSchema);
export default PhoneNumberModel;
