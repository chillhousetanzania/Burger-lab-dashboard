import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Menu } from './models.js';

dotenv.config();

// Map of Item Name -> Artifact Filename
const imageMap = {
    "Mediterranean Burger": "mediterranean_burger_1768772925172.png",
    "Lord of the Rings": "lord_of_the_rings_burger_1768773206918.png",
    "Smoky Mushrooms": "smoky_mushrooms_burger_1768773223098.png",
    "Tandoori Chicken": "tandoori_chicken_burger_1768772940647.png",
    "Butter Chicken": "butter_chicken_burger_1768773238007.png",
    "Flaky Chicken": "flaky_chicken_burger_1768773255235.png",
    "Buffalo Sauce": "buffalo_sauce_1768772959299.png",
    "BBQ Sauce": "bbq_sauce_1768773288215.png",
    "Smoky BBQ Sauce": "smoky_bbq_sauce_1768773304200.png",
    "Ranch Sauce": "ranch_sauce_1768773319742.png",
    "Cheddar Cheese Sauce": "cheddar_cheese_sauce_1768773359543.png",
    "Thousands Island Sauce": "thousands_island_sauce_1768773375613.png",
    "Texas Sauce": "texas_sauce_1768773391820.png",
    "Sriracha Sauce": "sriracha_sauce_1768773407273.png",
    "Caramelised Onions": "caramelised_onions_1768773444802.png",
    "Coleslaw": "coleslaw_1768773464116.png",
    "Onion Rings": "onion_rings_1768773484685.png",
    "Buffalo Wings Fried": "buffalo_wings_fried_1768773502140.png",
    "Fries": "french_fries_1768772980331.png",
    "Cheese Fries": "cheese_fries_1768773515682.png"
    // Mozzarella Sticks missing due to quota
};

const artifactDir = 'C:/Users/Andrew/.gemini/antigravity/brain/9543cfc3-5e96-4577-8029-71ea7e2f7df1';
const targetDir = 'd:/websites/burger-dashboard/burger-menu/images';

async function updateImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Move Images
        console.log('Moving images...');
        for (const [itemName, filename] of Object.entries(imageMap)) {
            const sourcePath = path.join(artifactDir, filename);
            const targetPath = path.join(targetDir, filename); // Keep original hashing for uniqueness

            try {
                await fs.copyFile(sourcePath, targetPath);
                console.log(`✅ Copied: ${filename}`);
            } catch (err) {
                console.error(`❌ Failed copy: ${filename}`, err.message);
            }
        }

        // 2. Update DB
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        if (!menu || !menu.data) throw new Error("No menu data found");

        const data = menu.data;
        let updatedCount = 0;

        // Helper to update list
        const updateList = (items) => {
            if (!items) return;
            items.forEach(item => {
                const name = item.name.en; // Assuming EN name matches key
                if (imageMap[name]) {
                    item.image = `images/${imageMap[name]}`;
                    updatedCount++;
                }
            });
        };

        updateList(data.burgers);
        updateList(data.chicken);
        updateList(data.sauces);
        updateList(data.sides);

        // Save
        await Menu.updateOne({ _id: menu._id }, { data: data });
        console.log(`✅ Database updated: ${updatedCount} items linked to new images`);

        process.exit(0);
    } catch (error) {
        console.error('Update Error:', error);
        process.exit(1);
    }
}

updateImages();
