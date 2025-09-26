import { Assistant } from "@/types/interfaces";
import mongoose from "mongoose";

const AssistantSchema = new mongoose.Schema<Assistant>({
    userId: { type: String, required: true },
    _id: { type: String, required: true },
}, { strict: false, timestamps: true });

const AssistantModel = mongoose.models.Assistant || mongoose.model("Assistant", AssistantSchema);
export default AssistantModel;
