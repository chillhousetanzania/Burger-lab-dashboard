import fetch from 'node-fetch';

const PORT = 5174; // Based on server.js defaults
const BASE_URL = `http://localhost:${PORT}`;

const testImage = "images/coleslaw_1768773464116.png";

async function testConnection() {
    try {
        console.log(`Testing connection to ${BASE_URL}...`);

        // 1. Test Generic Ping if available, or just root
        try {
            const res = await fetch(`${BASE_URL}/api/ping`);
            if (res.ok) console.log("✅ Server is UP (API Ping success)");
            else console.log("⚠️ Server responding but API Ping failed");
        } catch (e) {
            console.log("❌ Server seems DOWN or not reachable at port " + PORT);
            return;
        }

        // 2. Test Image Access (Root /images path)
        const rootUrl = `${BASE_URL}/${testImage}`;
        console.log(`Checking ${rootUrl}...`);
        const resRoot = await fetch(rootUrl);
        if (resRoot.ok) console.log(`✅ Image accessible at /images root: ${resRoot.status}`);
        else console.log(`❌ Image NOT accessible at /images root: ${resRoot.status}`);

        // 3. Test Image Access (via /menu/images path)
        const menuUrl = `${BASE_URL}/menu/${testImage}`;
        console.log(`Checking ${menuUrl}...`);
        const resMenu = await fetch(menuUrl);
        if (resMenu.ok) console.log(`✅ Image accessible at /menu/images: ${resMenu.status}`);
        else console.log(`❌ Image NOT accessible at /menu/images: ${resMenu.status}`);

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testConnection();
