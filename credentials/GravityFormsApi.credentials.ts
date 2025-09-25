import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class GravityFormsApi implements ICredentialType {
	name = 'gravityFormsApi';
	displayName = 'Gravity Forms API';
	documentationUrl = 'https://docs.gravityforms.com/rest-api-v2/';
	properties: INodeProperties[] = [
		{
			displayName: 'WordPress Site URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-site.com',
			description: 'Your WordPress site URL (the API path will be added automatically)',
			required: true,
			hint: 'Enter your WordPress site URL. The path /wp-json/gf/v2 will be added automatically if needed.',
		},
		{
			displayName: 'Authentication Method',
			name: 'authentication',
			type: 'options',
			options: [
				{
					name: 'Basic Auth',
					value: 'basic',
				},
				{
					name: 'OAuth 1.0a',
					value: 'oauth1',
				},
			],
			default: 'basic',
			description: 'The authentication method to use',
		},
		{
			displayName: 'Consumer Key',
			name: 'consumerKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The consumer key for authentication',
			required: true,
		},
		{
			displayName: 'Consumer Secret',
			name: 'consumerSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The consumer secret for authentication',
			required: true,
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'OAuth token (for OAuth authentication)',
			displayOptions: {
				show: {
					authentication: ['oauth1'],
				},
			},
		},
		{
			displayName: 'Token Secret',
			name: 'tokenSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'OAuth token secret (for OAuth authentication)',
			displayOptions: {
				show: {
					authentication: ['oauth1'],
				},
			},
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\/$/, "").includes("/wp-json/gf/v2") ? $credentials.baseUrl.replace(/\/$/, "") : $credentials.baseUrl.replace(/\/$/, "") + "/wp-json/gf/v2"}}',
			url: '/forms',
			method: 'GET',
		},
	};
}