import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
  if (cachedConnection) {
    console.log("Using cached database connection");
    return cachedConnection;
  }

  try {
    const dbUri = process.env.MONGO_URI || "";
    if (!dbUri) {
      throw new Error("MongoDB URI not found");
    }

    console.log("Establishing new database connection");
    cachedConnection = await mongoose.connect(dbUri);
    return cachedConnection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default connectDB;
