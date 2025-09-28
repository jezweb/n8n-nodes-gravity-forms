const https = require('https');
const http = require('http');

// Read credentials
const baseUrl = 'https://www.jezweb.com.au';
const consumerKey = 'ck_3727d2d8eabc00bcca1482afd7174726d8d6c431';
const consumerSecret = 'cs_2346c58d650b92bc25520ee30eb5247bf2c56096';

// Test function
async function testGravityFormsAPI() {
    console.log('=== Testing Gravity Forms API ===\n');

    // Test URLs
    const urls = [
        `${baseUrl}/wp-json/gf/v2/forms`,
        `${baseUrl}/wp-json/gf/v2`,
        `${baseUrl}/wp-json`,
    ];

    for (const testUrl of urls) {
        console.log(`Testing: ${testUrl}`);
        console.log('-'.repeat(50));

        try {
            const response = await makeRequest(testUrl, consumerKey, consumerSecret);
            console.log('Success!');
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers, null, 2));
            console.log('Body:', response.body.substring(0, 500));
        } catch (error) {
            console.log('Error:', error.message);
            if (error.statusCode) {
                console.log('Status Code:', error.statusCode);
            }
            if (error.body) {
                console.log('Response Body:', error.body.substring(0, 500));
            }
        }
        console.log('\n');
    }
}

function makeRequest(url, username, password) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        };

        console.log('Request options:', {
            hostname: options.hostname,
            path: options.path,
            auth: `${username.substring(0, 10)}... : ${password.substring(0, 10)}...`
        });

        const protocol = urlObj.protocol === 'https:' ? https : http;

        const req = protocol.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const result = {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                };

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(result);
                } else {
                    const error = new Error(`HTTP ${res.statusCode}`);
                    error.statusCode = res.statusCode;
                    error.body = data;
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Run the test
testGravityFormsAPI().catch(console.error);