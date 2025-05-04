import mongoose from 'mongoose';

let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
    if (cachedConnection) {
        console.log('Using cached database connection');
        return cachedConnection;
    }

    try {
        const dbUri = process.env.MONGO_URI || 'mongodb+srv://book_inventory:j4tOFRpBeFrL1cP2@cluster0.mrre3.mongodb.net/devazmth?retryWrites=true&w=majority&appName=Cluster0';

        console.log('Establishing new database connection');
        cachedConnection = await mongoose.connect(dbUri);
        return cachedConnection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export default connectDB;