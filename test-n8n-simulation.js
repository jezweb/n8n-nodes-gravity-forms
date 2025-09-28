const { GravityFormsApi } = require('./dist/credentials/GravityFormsApi.credentials.js');
const { GravityForms } = require('./dist/nodes/GravityForms/GravityForms.node.js');

// Simulate n8n's credential loading
const credentials = {
    baseUrl: 'https://www.jezweb.com.au',
    authentication: 'basic',
    consumerKey: 'ck_3727d2d8eabc00bcca1482afd7174726d8d6c431',
    consumerSecret: 'cs_2346c58d650b92bc25520ee30eb5247bf2c56096'
};

// Simulate n8n's context
class MockContext {
    constructor() {
        this.node = {
            name: 'GravityForms',
            type: 'n8n-nodes-base.gravityForms'
        };
    }

    async getCredentials(name) {
        console.log(`[Mock] getCredentials called for: ${name}`);
        return credentials;
    }

    getNode() {
        return this.node;
    }

    getNodeParameter(name, index, fallback) {
        console.log(`[Mock] getNodeParameter called: ${name}`);
        return fallback;
    }

    helpers = {
        httpRequest: async (options) => {
            console.log('[Mock] httpRequest called with:', {
                url: options.url,
                method: options.method,
                auth: options.auth ? { username: options.auth.username.substring(0, 20) + '...', password: '***' } : undefined
            });

            const https = require('https');
            const url = new URL(options.url);

            return new Promise((resolve, reject) => {
                const auth = Buffer.from(`${options.auth.username}:${options.auth.password}`).toString('base64');

                const reqOptions = {
                    hostname: url.hostname,
                    path: url.pathname + (url.search || ''),
                    method: options.method,
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                };

                const req = https.request(reqOptions, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                resolve(JSON.parse(data));
                            } catch {
                                resolve(data);
                            }
                        } else {
                            const error = new Error(`HTTP ${res.statusCode}`);
                            error.response = { status: res.statusCode };
                            error.statusCode = res.statusCode;
                            reject(error);
                        }
                    });
                });

                req.on('error', reject);
                req.end();
            });
        }
    };
}

async function testLoadOptions() {
    console.log('=== Testing n8n Node Simulation ===\n');

    const node = new GravityForms();
    const context = new MockContext();

    // Test if loadOptions exists
    console.log('Node has loadOptions:', !!node.description.properties[0].loadOptions);
    console.log('Node methods:', Object.keys(node.methods || {}));

    if (node.methods && node.methods.loadOptions) {
        console.log('\nTrying to call getForms method...');

        try {
            // Call getForms directly
            const getForms = node.methods.loadOptions.getForms;
            if (getForms) {
                const forms = await getForms.call(context);
                console.log('\nForms loaded successfully:');
                console.log(JSON.stringify(forms, null, 2));
            } else {
                console.log('getForms method not found');
            }
        } catch (error) {
            console.error('\nError loading forms:');
            console.error(error.message);
            if (error.response) {
                console.error('Response status:', error.statusCode);
            }
        }
    }

    // Also test the generic function directly
    console.log('\n\nTesting makeGravityFormsApiRequest directly...');
    const { makeGravityFormsApiRequest } = require('./dist/nodes/GravityForms/GenericFunctions.js');

    try {
        const result = await makeGravityFormsApiRequest.call(context, 'GET', '/forms');
        console.log('Direct API call succeeded!');
        console.log('Forms:', Object.keys(result));
    } catch (error) {
        console.error('Direct API call failed:', error.message);
    }
}

testLoadOptions().catch(console.error);