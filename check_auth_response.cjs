
// check_auth_response.js
const fs = require('fs');
const path = require('path');

async function testRegister() {
    const randomId = Math.floor(Math.random() * 100000);
    const formData = new FormData();

    formData.append('name', `Test User ${randomId}`);
    formData.append('username', `testuser${randomId}`);
    formData.append('email', `testuser${randomId}@example.com`);
    formData.append('password', 'password123');
    formData.append('password_confirmation', 'password123');
    formData.append('province_id', '1');
    formData.append('district_id', '1');
    formData.append('municipality_id', '1');
    formData.append('ward_no', '1');
    formData.append('street', 'Street 1');
    formData.append('interests[]', '1');

    try {
        const filePath = path.join(__dirname, 'public', 'mainLogo.png');
        // Check if file exists, if not create a dummy one
        if (!fs.existsSync(filePath)) {
            console.log("Logo not found, creating dummy file");
            fs.writeFileSync('dummy.jpg', 'dummy content');
            const fileBlob = new Blob([fs.readFileSync('dummy.jpg')]);
            formData.append('profile_picture', fileBlob, 'dummy.jpg');
        } else {
            const fileBlob = new Blob([fs.readFileSync(filePath)]);
            formData.append('profile_picture', fileBlob, 'mainLogo.png');
        }

        console.log("Sending request...", `testuser${randomId}@example.com`);
        const response = await fetch("https://taren-terrigenous-zackary.ngrok-free.dev/api/register", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "true"
                // Content-Type header is set automatically with boundary by fetch for FormData
            },
            body: formData
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body Length:", text.length);
        console.log("Body Preview:", text.substring(0, 500));
        try {
            const json = JSON.parse(text);
            console.log("Root keys:", Object.keys(json));
            if (json.data) console.log("Data keys:", Object.keys(json.data));
            console.log("Token in root:", !!json.token);
            console.log("Token in data:", !!(json.data && json.data.token));
            console.log("Token in data.attributes:", !!(json.data && json.data.attributes && json.data.attributes.token));
        } catch (e) {
            console.log("Could not parse JSON body");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testRegister();
