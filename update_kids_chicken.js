import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function updateKidsChicken() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        const data = menu.data;

        if (data.kids) {
            data.kids.forEach(item => {
                if (item.id === "kids_chicken") {
                    item.image = "images/kids_chicken_meal.jpg";
                    console.log("✅ Updated Kids Chicken Burger image");
                }
            });
            await Menu.updateOne({ _id: menu._id }, { data: data });
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
updateKidsChicken();
