import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function fixColors() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected.");

        const menu = await Menu.findOne().sort({ createdAt: -1 });
        if (!menu) throw new Error("Menu not found");

        const data = menu.data;
        if (!data.categorySettings) data.categorySettings = {};

        console.log("Applying Color Fixes...");

        // Force Brand Red for ALL
        data.categorySettings.all = {
            id: 'all',
            title: 'ALL MENU',
            color: '#A01E28',
            image: "images/banner_all.webp"
        };

        // Force Orange for Kids
        data.categorySettings.kids = {
            id: 'kids',
            title: 'KIDS MENU',
            color: '#FF9800',
            image: "images/banner_all.webp"
        };

        // Force Red for Burgers to be safe
        data.categorySettings.burgers = {
            id: 'burgers',
            title: 'Burgers',
            color: '#A01E28',
            image: "images/banner_burgers.png"
        };

        await Menu.updateOne({ _id: menu._id }, { data: data });
        console.log('✅ Colors successfully reset: All=Red, Kids=Orange');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("FATAL ERROR:", error.message);
        process.exit(1);
    }
}
fixColors();
