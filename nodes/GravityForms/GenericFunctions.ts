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

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

/**
 * Fetch file from URL and return as binary data
 */
export async function fetchFileFromUrl(
	this: IExecuteFunctions,
	fileUrl: string,
): Promise<{ data: Buffer; mimeType?: string; fileName?: string }> {
	try {
		const response = await this.helpers.httpRequest({
			url: fileUrl,
			method: 'GET',
			encoding: 'arraybuffer',
			returnFullResponse: true,
		});

		const buffer = Buffer.from(response.body as ArrayBuffer);
		const contentType = response.headers['content-type'] as string;

		// Try to extract filename from Content-Disposition header or URL
		let fileName: string | undefined;
		const contentDisposition = response.headers['content-disposition'] as string;
		if (contentDisposition) {
			const match = contentDisposition.match(/filename="?([^";\n]*)"?/);
			if (match && match[1]) {
				fileName = match[1];
			}
		}
		if (!fileName) {
			// Extract from URL
			const urlPath = new URL(fileUrl).pathname;
			fileName = urlPath.split('/').pop() || 'file';
		}

		return {
			data: buffer,
			mimeType: contentType,
			fileName,
		};
	} catch (error: any) {
		throw new NodeApiError(this.getNode(), error, {
			message: `Failed to fetch file from URL: ${fileUrl}`,
		});
	}
}

/**
 * Process file input - handles both binary data and URLs
 */
export async function processFileInput(
	this: IExecuteFunctions,
	fieldId: string,
	fileInputType: string,
	itemIndex: number,
): Promise<IDataObject | undefined> {
	if (fileInputType === 'url') {
		// Handle URL input
		const fileUrl = this.getNodeParameter(`fileFields.field.${itemIndex}.fileUrl`, itemIndex, '') as string;
		if (!fileUrl) return undefined;

		if (!isValidUrl(fileUrl)) {
			throw new NodeApiError(this.getNode(), {}, {
				message: `Invalid file URL provided for field ${fieldId}: ${fileUrl}`,
			});
		}

		const fileData = await fetchFileFromUrl.call(this, fileUrl);

		return {
			fieldId,
			data: fileData.data.toString('base64'),
			mimeType: fileData.mimeType || 'application/octet-stream',
			fileName: fileData.fileName || `file_${fieldId}`,
		};
	} else {
		// Handle binary data input
		const binaryPropertyName = this.getNodeParameter(`fileFields.field.${itemIndex}.binaryProperty`, itemIndex, '') as string;
		if (!binaryPropertyName) return undefined;

		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

		return {
			fieldId,
			data: buffer.toString('base64'),
			mimeType: binaryData.mimeType || 'application/octet-stream',
			fileName: binaryData.fileName || `file_${fieldId}`,
		};
	}
}

export function calculateDateRange(quickRange: string, dateFrom?: string, dateTo?: string): { from: string; to: string } {
	const now = new Date();
	let from: Date;
	let to: Date = new Date();

	switch (quickRange) {
		case 'today':
			from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
			break;
		case 'yesterday':
			from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
			to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
			break;
		case 'last24Hours':
			from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			to = now;
			break;
		case 'last7Days':
			from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			to = now;
			break;
		case 'last30Days':
			from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			to = now;
			break;
		case 'thisWeek':
			const dayOfWeek = now.getDay();
			const diff = now.getDate() - dayOfWeek;
			from = new Date(now.getFullYear(), now.getMonth(), diff);
			to = now;
			break;
		case 'thisMonth':
			from = new Date(now.getFullYear(), now.getMonth(), 1);
			to = now;
			break;
		case 'thisYear':
			from = new Date(now.getFullYear(), 0, 1);
			to = now;
			break;
		case 'custom':
		default:
			from = dateFrom ? new Date(dateFrom) : new Date(0);
			to = dateTo ? new Date(dateTo) : now;
			break;
	}

	return {
		from: from.toISOString(),
		to: to.toISOString(),
	};
}

export async function makeGravityFormsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	retryCount = 0,
): Promise<any> {
	const credentials = await this.getCredentials('gravityFormsApi') as ICredentialDataDecryptedObject;

	let baseUrl = credentials.baseUrl as string;
	baseUrl = normalizeBaseUrl(baseUrl);
	const authentication = (credentials.authentication as string) || 'basic';  // Default to basic if not set
	const consumerKey = credentials.consumerKey as string;
	const consumerSecret = credentials.consumerSecret as string;

	const url = `${baseUrl}${endpoint}`;

	const options: IHttpRequestOptions = {
		method,
		url,
		json: true,
		qs,
		headers: {},
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (authentication === 'basic') {
		// Basic Authentication - use only the auth property (what was working before)
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
	} catch (error: any) {
		// Enhanced error handling with friendly messages
		const errorMessage = error.message || 'Unknown error';
		const statusCode = error.response?.status || error.statusCode;

		// Provide more specific error messages based on common scenarios
		if (statusCode === 401) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Authentication failed. Please check your Gravity Forms API credentials (consumer key and secret).',
			});
		} else if (statusCode === 403) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Permission denied. Ensure your API key has the necessary permissions for this operation.',
			});
		} else if (statusCode === 404) {
			// Special handling for main endpoints
			if (endpoint === '/forms') {
				throw new NodeApiError(this.getNode(), error, {
					message: 'Gravity Forms API endpoint not found. Please ensure: 1) Gravity Forms v2.4+ is installed, 2) REST API is enabled in Forms → Settings → REST API, 3) The WordPress URL is correct',
				});
			}
			const resourceType = endpoint.includes('/forms/') ? 'form' : endpoint.includes('/entries/') ? 'entry' : 'resource';
			throw new NodeApiError(this.getNode(), error, {
				message: `The requested ${resourceType} was not found. Please check the ID and try again.`,
			});
		} else if (statusCode === 429) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'API rate limit exceeded. Please wait a moment before trying again.',
			});
		} else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
			throw new NodeApiError(this.getNode(), error, {
				message: `Cannot connect to Gravity Forms API. Please verify your WordPress site URL: ${baseUrl}`,
			});
		} else if (errorMessage.includes('ETIMEDOUT')) {
			// Simple retry logic for timeouts
			if (retryCount < 2) {
				await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
				return makeGravityFormsApiRequest.call(this, method, endpoint, body, qs, retryCount + 1);
			}
			throw new NodeApiError(this.getNode(), error, {
				message: 'Request timed out. The server may be slow or unreachable.',
			});
		}

		// Default error handling
		throw new NodeApiError(this.getNode(), error);
	}
}