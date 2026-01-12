
const https = require('https');

const url = "https://trendingvista.com/lems/api/event/price/0-1000";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Keys:', Object.keys(json));
            if (json.data) {
                console.log('json.data Keys:', Object.keys(json.data));
                if (json.data.data) {
                    console.log('json.data.data is Array?', Array.isArray(json.data.data));
                    console.log('json.data.data Length:', json.data.data.length);
                }
            }
            console.log('Full structure sample:', JSON.stringify(json).substring(0, 200));
        } catch (e) {
            console.error(e);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
