import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IWebhookFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ICredentialDataDecryptedObject,
	NodeApiError,
} from 'n8n-workflow';
import * as crypto from 'crypto';

export function normalizeBaseUrl(url: string): string {
	url = url.trim().replace(/\/$/, ''); // Remove trailing slash
	if (!url.includes('/wp-json/gf/v2')) {
		url = `${url}/wp-json/gf/v2`;
	}
	return url;
}

export async function makeGravityFormsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('gravityFormsApi') as ICredentialDataDecryptedObject;

	let baseUrl = credentials.baseUrl as string;
	baseUrl = normalizeBaseUrl(baseUrl);
	const authentication = credentials.authentication as string;
	const consumerKey = credentials.consumerKey as string;
	const consumerSecret = credentials.consumerSecret as string;

	const url = `${baseUrl}${endpoint}`;

	const options: IHttpRequestOptions = {
		method,
		url,
		json: true,
		qs,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (authentication === 'basic') {
		// Basic Authentication
		options.auth = {
			username: consumerKey,
			password: consumerSecret,
		};
	} else if (authentication === 'oauth1') {
		// OAuth 1.0a Authentication
		const token = credentials.token as string;
		const tokenSecret = credentials.tokenSecret as string;

		const timestamp = Math.floor(Date.now() / 1000).toString();
		const nonce = crypto.randomBytes(16).toString('hex');

		const oauthParams: IDataObject = {
			oauth_consumer_key: consumerKey,
			oauth_token: token,
			oauth_signature_method: 'HMAC-SHA1',
			oauth_timestamp: timestamp,
			oauth_nonce: nonce,
			oauth_version: '1.0',
		};

		// Create signature base string
		const allParams = { ...oauthParams, ...qs };
		const sortedParams = Object.keys(allParams)
			.sort()
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key] as string)}`)
			.join('&');

		const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;

		// Create signing key
		const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

		// Generate signature
		const signature = crypto
			.createHmac('sha1', signingKey)
			.update(signatureBaseString)
			.digest('base64');

		oauthParams.oauth_signature = signature;

		// Create Authorization header
		const authHeader = 'OAuth ' + Object.keys(oauthParams)
			.map(key => `${key}="${encodeURIComponent(oauthParams[key] as string)}"`)
			.join(', ');

		options.headers = {
			'Authorization': authHeader,
		};
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}