import {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { makeGravityFormsApiRequest } from './GenericFunctions';

export class GravityFormsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Gravity Forms Trigger',
		name: 'gravityFormsTrigger',
		icon: 'file:gravityForms.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerOn"]}}',
		description: 'Starts the workflow when Gravity Forms events occur',
		defaults: {
			name: 'Gravity Forms Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'gravityFormsApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				options: [
					{
						name: 'New Entry',
						value: 'newEntry',
						description: 'Trigger when a new entry is submitted',
					},
					{
						name: 'Updated Entry',
						value: 'updatedEntry',
						description: 'Trigger when an entry is updated',
					},
				],
				default: 'newEntry',
				required: true,
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Polling',
						value: 'polling',
						description: 'Check for new entries at regular intervals',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Receive instant notifications via webhook',
					},
				],
				default: 'polling',
				description: 'How to watch for events',
			},
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getForms',
				},
				default: '',
				description: 'Watch specific form or all forms. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Entry Status',
						name: 'status',
						type: 'options',
						options: [
							{
								name: 'Active',
								value: 'active',
							},
							{
								name: 'Spam',
								value: 'spam',
							},
							{
								name: 'Trash',
								value: 'trash',
							},
							{
								name: 'All',
								value: 'all',
							},
						],
						default: 'active',
						description: 'Filter by entry status',
					},
					{
						displayName: 'Include Entry Data',
						name: 'includeData',
						type: 'boolean',
						default: true,
						description: 'Whether to include full entry data in the trigger output',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await makeGravityFormsApiRequest.call(this, 'GET', '/forms');
					let forms = [];

					if (response && typeof response === 'object' && !Array.isArray(response)) {
						forms = Object.values(response);
					} else if (Array.isArray(response)) {
						forms = response;
					}

					if (!forms || forms.length === 0) {
						return [{
							name: 'No Forms Found',
							value: '',
						}];
					}

					const allOption = {
						name: 'All Forms',
						value: 'all',
					};

					const formOptions = forms.map((form: any) => ({
						name: `${form.title || 'Untitled Form'} (ID: ${form.id})`,
						value: form.id ? form.id.toString() : '',
					}));

					return [allOption, ...formOptions];
				} catch (error: any) {
					return [{
						name: `Error: ${error.message || 'Failed to load forms'}`,
						value: '',
					}];
				}
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const triggerOn = this.getNodeParameter('triggerOn') as string;
		const formId = this.getNodeParameter('formId', '') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const now = new Date().toISOString();
		const lastCheck = webhookData.lastCheck as string || new Date(0).toISOString();

		try {
			const qs: IDataObject = {};

			if (formId && formId !== 'all') {
				qs.form_id = formId;
			}

			if (options.status && options.status !== 'all') {
				qs.status = options.status;
			}

			// For new entries, filter by date created
			if (triggerOn === 'newEntry') {
				qs.search = JSON.stringify({
					field_filters: [
						{
							key: 'date_created',
							operator: '>',
							value: lastCheck,
						},
					],
				});
			} else if (triggerOn === 'updatedEntry') {
				// For updated entries, filter by date updated
				qs.search = JSON.stringify({
					field_filters: [
						{
							key: 'date_updated',
							operator: '>',
							value: lastCheck,
						},
					],
				});
			}

			const response = await makeGravityFormsApiRequest.call(
				this,
				'GET',
				'/entries',
				{},
				qs,
			);

			let entries = [];
			if (response && response.entries) {
				entries = response.entries;
			} else if (Array.isArray(response)) {
				entries = response;
			}

			webhookData.lastCheck = now;

			if (entries.length === 0) {
				return null;
			}

			// If includeData is false, only return entry IDs
			if (options.includeData === false) {
				entries = entries.map((entry: any) => ({
					id: entry.id,
					form_id: entry.form_id,
					date_created: entry.date_created,
					date_updated: entry.date_updated,
				}));
			}

			return [entries.map((entry: any) => ({
				json: entry,
			}))];
		} catch (error) {
			throw error;
		}
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const triggerOn = this.getNodeParameter('triggerOn') as string;
		const formId = this.getNodeParameter('formId', '') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Validate webhook data
		if (!body || typeof body !== 'object') {
			return {
				workflowData: [],
			};
		}

		// Check if this is the correct form
		if (formId && formId !== 'all' && body.form_id !== formId) {
			return {
				workflowData: [],
			};
		}

		// Check entry status filter
		if (options.status && options.status !== 'all' && body.status !== options.status) {
			return {
				workflowData: [],
			};
		}

		// For updated entry trigger, check if entry has been updated
		if (triggerOn === 'updatedEntry' && body.date_created === body.date_updated) {
			return {
				workflowData: [],
			};
		}

		// If includeData is false, only return essential fields
		let entryData = body;
		if (options.includeData === false) {
			entryData = {
				id: body.id,
				form_id: body.form_id,
				date_created: body.date_created,
				date_updated: body.date_updated,
			};
		}

		return {
			workflowData: [
				[
					{
						json: entryData as IDataObject,
					},
				],
			],
		};
	}
}