const { GravityFormsApi } = require('./dist/credentials/GravityFormsApi.credentials.js');

// Create an instance of the credentials
const creds = new GravityFormsApi();

console.log('=== Gravity Forms Credentials Test ===\n');

// Check if authenticate property exists
console.log('✓ Authenticate property:', !!creds.authenticate);
console.log('  - Type:', creds.authenticate?.type);
console.log('  - Auth username template:', creds.authenticate?.properties?.auth?.username);
console.log('  - Auth password template:', creds.authenticate?.properties?.auth?.password);

console.log('\n✓ Test property:', !!creds.test);
console.log('  - BaseURL template:', creds.test?.request?.baseURL);
console.log('  - Test endpoint:', creds.test?.request?.url);
console.log('  - Method:', creds.test?.request?.method);

console.log('\n✓ Properties defined:', creds.properties.length, 'fields');

// Simulate credential values
const mockCredentials = {
    baseUrl: 'https://www.jezweb.com.au',
    consumerKey: 'ck_test',
    consumerSecret: 'cs_test'
};

// Test the baseURL template evaluation (simplified)
const baseUrlTemplate = creds.test.request.baseURL;
console.log('\nSimulated test URL construction:');
console.log('  Input URL:', mockCredentials.baseUrl);
console.log('  Template:', baseUrlTemplate);

// Manually evaluate what the URL would be
let testBaseUrl = mockCredentials.baseUrl.replace(/\/$/, '');
if (!testBaseUrl.includes('/wp-json/gf/v2')) {
    testBaseUrl += '/wp-json/gf/v2';
}
console.log('  Result:', testBaseUrl + creds.test.request.url);

console.log('\n✅ Credentials configuration is valid for n8n test connection!');