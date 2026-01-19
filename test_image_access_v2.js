// Native fetch (Node 18+)
const PORT = 5174;
const BASE_URL = `http://localhost:${PORT}`;
const testImage = "images/coleslaw_1768773464116.png";

async function testConnection() {
    try {
        console.log(`Testing connection to ${BASE_URL}...`);

        // 1. Test Generic Ping
        try {
            const res = await fetch(`${BASE_URL}/api/ping`);
            if (res.ok) console.log("✅ Server is UP (API Ping success)");
            else console.log("⚠️ Server responding but API Ping failed: " + res.status);
        } catch (e) {
            console.log("❌ Server seems DOWN or not reachable at port " + PORT);
            console.log(e.message);
            // If server is down, no point checking images
            // return; 
        }

        // 2. Test Image Access (Root /images path)
        const rootUrl = `${BASE_URL}/${testImage}`;
        console.log(`Checking ${rootUrl}...`);
        try {
            const resRoot = await fetch(rootUrl);
            if (resRoot.ok) console.log(`✅ Image accessible at /images root: ${resRoot.status} ${resRoot.statusText}`);
            else console.log(`❌ Image NOT accessible at /images root: ${resRoot.status} ${resRoot.statusText}`);
        } catch (e) { console.log("❌ Failed to fetch root image: " + e.message); }

        // 3. Test Image Access (via /menu/images path)
        const menuUrl = `${BASE_URL}/menu/${testImage}`;
        console.log(`Checking ${menuUrl}...`);
        try {
            const resMenu = await fetch(menuUrl);
            if (resMenu.ok) console.log(`✅ Image accessible at /menu/images: ${resMenu.status} ${resMenu.statusText}`);
            else console.log(`❌ Image NOT accessible at /menu/images: ${resMenu.status} ${resMenu.statusText}`);
        } catch (e) { console.log("❌ Failed to fetch menu image: " + e.message); }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testConnection();
