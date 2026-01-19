import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function fixOnions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const menu = await Menu.findOne().sort({ createdAt: -1 });
        if (!menu || !menu.data) throw new Error("No menu data found");

        const data = menu.data;
        let found = false;

        // Find and update Onions
        // The item name in DB is likely "Caramelizsed Onions" (typo from seed) or "Caramelised Onions" depending on merge
        // Let's search loosely
        if (data.sides) {
            data.sides.forEach(item => {
                if (item.name.en.includes("Onions")) {
                    console.log(`Found item: ${item.name.en}`);
                    // Force update to correct image
                    item.image = "images/caramelised_onions_1768773444802.png";
                    // Also fix name typo if present
                    if (item.name.en === "Caramelizsed Onions") {
                        item.name.en = "Caramelized Onions"; // Fix spelling
                    }
                    found = true;
                }
            });
        }

        if (found) {
            await Menu.updateOne({ _id: menu._id }, { data: data });
            console.log('✅ Updated Onions image and spelling.');
        } else {
            console.log('❌ Onions item not found in Sides.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Fix Error:', error);
        process.exit(1);
    }
}

fixOnions();
