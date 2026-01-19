import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Menu } from './models.js';

dotenv.config();

async function updateKidsNuggets() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        const data = menu.data;

        if (data.kids) {
            data.kids.forEach(item => {
                if (item.id === "kids_nuggets") {
                    item.image = "images/kids_nuggets_meal.jpg";
                    console.log("✅ Updated Kids Nuggets Meal image");
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
updateKidsNuggets();
