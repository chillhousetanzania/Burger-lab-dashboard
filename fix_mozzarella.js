import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function fixMozzarella() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const menu = await Menu.findOne().sort({ createdAt: -1 });
        if (!menu || !menu.data) throw new Error("No menu data found");

        const data = menu.data;
        let found = false;

        // Find Mozzarella Sticks
        if (data.sides) {
            data.sides.forEach(item => {
                if (item.name.en.includes("Mozzarella Sticks")) {
                    console.log(`Found item: ${item.name.en}`);
                    // Use Cheese Fries as a temp visual or placeholder
                    // Let's use generic placeholder to be safe/accurate: images/placeholder.webp
                    item.image = "images/placeholder.webp";
                    found = true;
                }
            });
        }

        if (found) {
            await Menu.updateOne({ _id: menu._id }, { data: data });
            console.log('✅ Set Mozzarella Sticks to generic placeholder.');
        } else {
            console.log('❌ Mozzarella Sticks item not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Fix Error:', error);
        process.exit(1);
    }
}

fixMozzarella();
