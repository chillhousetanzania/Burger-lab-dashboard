import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
    try {
        console.log('--- Audit 2.5: Scripted Upload Test ---');

        // 1. Get Token
        const loginRes = await axios.post('http://localhost:5174/api/login', { password: 'admin' });
        const token = loginRes.data.token;
        console.log('✅ Token obtained');

        // 2. Upload dummy file
        const form = new FormData();
        // Use an existing image if available, else a small dummy
        const testFile = 'public/vite.svg'; // Usually exists in these projects
        if (!fs.existsSync(testFile)) {
            console.error('Test file not found');
            process.exit(1);
        }

        form.append('image', fs.createReadStream(testFile));

        const uploadRes = await axios.post('http://localhost:5174/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Upload Success! Result:', uploadRes.data);
        process.exit(0);
    } catch (err) {
        console.error('❌ Upload Test FAILED');
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

testUpload();
