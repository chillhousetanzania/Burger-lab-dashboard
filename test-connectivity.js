import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('--- Audit 1: Cloud Connectivity Test ---');

async function testConnections() {
    try {
        // 1. Test MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully!');

        // 2. Test Cloudinary
        console.log('Checking Cloudinary Configuration...');
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Simple API call to test auth
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connected Successfully! Status:', result.status);

        await mongoose.disconnect();
        console.log('Audit 1: SUCCESS');
        process.exit(0);
    } catch (err) {
        console.error('❌ Audit 1: FAILED');
        console.error(err);
        process.exit(1);
    }
}

testConnections();
