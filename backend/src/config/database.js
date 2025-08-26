import { connect } from 'mongoose';

const connectDB = async (MONGODB_CONNECTION_URI, DB_NAME) => {
    try {
        const conn = await connect(MONGODB_CONNECTION_URI, { dbName: DB_NAME });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (e) {
        console.error(`❌ MongoDB Connection Error: ${e.message}`);
        process.exit(1);
    }
};

export default connectDB;