import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { formOperations, formFields } from './operations/FormOperations';
import { entryOperations, entryFields } from './operations/EntryOperations';
import { makeGravityFormsApiRequest, calculateDateRange } from './GenericFunctions';

export class GravityForms implements INodeType {
	// @ts-ignore - usableAsTool is not in TypeScript definitions yet
	description: INodeTypeDescription = {
		displayName: 'Gravity Forms',
		name: 'gravityForms',
		icon: 'file:gravityForms.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Gravity Forms to manage forms and entries',
		defaults: {
			name: 'Gravity Forms',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'gravityFormsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Form',
						value: 'form',
					},
					{
						name: 'Entry',
						value: 'entry',
					},
				],
				default: 'form',
			},
			...formOperations,
			...formFields,
			...entryOperations,
			...entryFields,
		],
	};

	methods = {
		loadOptions: {
			async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await makeGravityFormsApiRequest.call(this, 'GET', '/forms');

					// Handle different possible response structures
					let forms = [];

					// Gravity Forms API returns an object where keys are form IDs
					if (response && typeof response === 'object' && !Array.isArray(response)) {
						// Convert object to array
						forms = Object.values(response);
					} else if (Array.isArray(response)) {
						forms = response;
					} else if (response && typeof response === 'object') {
						// Check common response wrapper patterns
						if (response.forms) {
							forms = Array.isArray(response.forms) ? response.forms : Object.values(response.forms);
						} else if (response.data) {
							forms = Array.isArray(response.data) ? response.data : Object.values(response.data);
						}
					}

					if (!forms || forms.length === 0) {
						return [{
							name: 'No Forms Found - Check Your Credentials and Gravity Forms API Access',
							value: '',
						}];
					}

					return forms.map((form: any) => ({
						name: `${form.title || 'Untitled Form'} (ID: ${form.id})`,
						value: form.id ? form.id.toString() : '',
					}));
				} catch (error: any) {
					console.error('Error loading forms:', error);
					// Provide helpful error feedback in the dropdown
					return [{
						name: `Error: ${error.message || 'Failed to load forms. Check credentials.'}`,
						value: '',
					}];
				}
			},

			async getFormFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const formId = this.getCurrentNodeParameter('formId') as string;

					if (!formId) {
						return [{
							name: 'Please Select a Form First',
							value: '',
						}];
					}

					const response = await makeGravityFormsApiRequest.call(this, 'GET', `/forms/${formId}`);

					// Handle the response - form data might be wrapped
					const form = response || {};
					const fields = form.fields || form.form_fields || [];

					if (!Array.isArray(fields) || fields.length === 0) {
						return [{
							name: 'No Fields Found in This Form',
							value: '',
						}];
					}

					return fields.map((field: any) => ({
						name: `${field.label || `Field ${field.id}`} (ID: ${field.id}, Type: ${field.type || 'text'})`,
						value: field.id ? field.id.toString() : '',
					}));
				} catch (error: any) {
					console.error('Error loading form fields:', error);
					return [{
						name: `Error: ${error.message || 'Failed to load fields'}`,
						value: '',
					}];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'form') {
					if (operation === 'get') {
						const formId = this.getNodeParameter('formId', i) as string;
						responseData = await makeGravityFormsApiRequest.call(
							this,
							'GET',
							`/forms/${formId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 10) as number;

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'GET',
							'/forms',
						);

						if (!returnAll && Array.isArray(responseData)) {
							responseData = responseData.slice(0, limit);
						}
					} else if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const description = this.getNodeParameter('description', i, '') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							title,
							description,
							...additionalFields,
						};

						if (additionalFields.fields) {
							body.fields = JSON.parse(additionalFields.fields as string);
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'POST',
							'/forms',
							body,
						);
					} else if (operation === 'update') {
						const formId = this.getNodeParameter('formId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						if (updateFields.fields) {
							updateFields.fields = JSON.parse(updateFields.fields as string);
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'PUT',
							`/forms/${formId}`,
							updateFields,
						);
					} else if (operation === 'delete') {
						const formId = this.getNodeParameter('formId', i) as string;
						responseData = await makeGravityFormsApiRequest.call(
							this,
							'DELETE',
							`/forms/${formId}`,
						);
					}
				} else if (resource === 'entry') {
					if (operation === 'get') {
						const entryId = this.getNodeParameter('entryId', i) as string;
						responseData = await makeGravityFormsApiRequest.call(
							this,
							'GET',
							`/entries/${entryId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 10) as number;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const qs: IDataObject = {};
						if (filters.formId) {
							qs.form_id = filters.formId;
						}
						if (filters.status) {
							qs.status = filters.status;
						}

						// Build search filters from UI
						const searchFilters: any[] = [];

						// Add field filters
						if (filters.fieldFilters) {
							const fieldFilters = (filters.fieldFilters as any).filter;
							if (Array.isArray(fieldFilters)) {
								fieldFilters.forEach(filter => {
									if (filter.fieldId && filter.value) {
										searchFilters.push({
											key: filter.fieldId,
											operator: filter.operator || '=',
											value: filter.value,
										});
									}
								});
							}
						}

						// Add date range filters
						if (filters.dateRange) {
							const dateRange = filters.dateRange as IDataObject;
							if (dateRange.quickRange || dateRange.dateFrom || dateRange.dateTo) {
								const range = calculateDateRange(
									dateRange.quickRange as string || 'custom',
									dateRange.dateFrom as string,
									dateRange.dateTo as string,
								);
								const dateField = dateRange.dateField || 'date_created';

								searchFilters.push({
									key: dateField,
									operator: '>=',
									value: range.from,
								});
								searchFilters.push({
									key: dateField,
									operator: '<=',
									value: range.to,
								});
							}
						}

						// Use advanced JSON search if provided (overrides field filters)
						if (filters.search) {
							const searchJson = typeof filters.search === 'string'
								? JSON.parse(filters.search)
								: filters.search;
							qs.search = JSON.stringify(searchJson);
						} else if (searchFilters.length > 0) {
							qs.search = JSON.stringify({ field_filters: searchFilters });
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'GET',
							'/entries',
							{},
							qs,
						);

						if (!returnAll && Array.isArray(responseData.entries)) {
							responseData = responseData.entries.slice(0, limit);
						} else if (responseData.entries) {
							responseData = responseData.entries;
						}
					} else if (operation === 'create') {
						const formId = this.getNodeParameter('formId', i) as string;
						const fields = this.getNodeParameter('fields', i, {}) as any;
						const entryFields = this.getNodeParameter('entryFields', i, {}) as IDataObject;

						const body: IDataObject = {
							form_id: formId,
							...entryFields,
						};

						// Process field values from the new structure
						if (fields.field && Array.isArray(fields.field)) {
							fields.field.forEach((fieldData: any) => {
								if (fieldData.fieldId) {
									body[fieldData.fieldId] = fieldData.value;
								}
							});
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'POST',
							'/entries',
							body,
						);
					} else if (operation === 'sendNotification') {
						const entryId = this.getNodeParameter('entryId', i) as string;
						const notificationOptions = this.getNodeParameter('notificationOptions', i, {}) as IDataObject;

						const body: IDataObject = {};

						// Add notification IDs if specified
						if (notificationOptions.notificationIds) {
							const ids = (notificationOptions.notificationIds as string).split(',').map(id => id.trim());
							body.notifications = ids;
						}

						// Add email overrides
						if (notificationOptions.toEmail) {
							body.to = notificationOptions.toEmail;
						}
						if (notificationOptions.fromEmail) {
							body.from = notificationOptions.fromEmail;
						}
						if (notificationOptions.bccEmail) {
							body.bcc = notificationOptions.bccEmail;
						}
						if (notificationOptions.subject) {
							body.subject = notificationOptions.subject;
						}
						if (notificationOptions.message) {
							body.message = notificationOptions.message;
						}
						if (notificationOptions.event) {
							body.event = notificationOptions.event;
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'POST',
							`/entries/${entryId}/notifications`,
							body,
						);

						// Format response
						if (responseData && !responseData.is_success) {
							responseData.error = 'Failed to send some or all notifications';
						}
					} else if (operation === 'submit') {
						const formId = this.getNodeParameter('formId', i) as string;
						const submissionFields = this.getNodeParameter('submissionFields', i, {}) as any;
						const submissionOptions = this.getNodeParameter('submissionOptions', i, {}) as IDataObject;

						const body: IDataObject = {
							input_values: {},
						};

						// Process field values from the UI
						if (submissionFields.field && Array.isArray(submissionFields.field)) {
							submissionFields.field.forEach((fieldData: any) => {
								if (fieldData.fieldId) {
									(body.input_values as IDataObject)[`input_${fieldData.fieldId}`] = fieldData.value;
								}
							});
						}

						// Add additional field values from JSON if provided
						if (submissionOptions.field_values) {
							const additionalValues = typeof submissionOptions.field_values === 'string'
								? JSON.parse(submissionOptions.field_values)
								: submissionOptions.field_values;

							Object.keys(additionalValues).forEach(key => {
								const inputKey = key.startsWith('input_') ? key : `input_${key}`;
								(body.input_values as IDataObject)[inputKey] = additionalValues[key];
							});
						}

						// Add page information for multi-page forms
						if (submissionOptions.source_page !== undefined) {
							body.source_page = submissionOptions.source_page;
						}
						if (submissionOptions.target_page !== undefined) {
							body.target_page = submissionOptions.target_page;
						}

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'POST',
							`/forms/${formId}/submissions`,
							body,
						);

						// Handle submission response
						if (responseData && responseData.is_valid === false) {
							// Include validation errors in response
							responseData.validation_errors = responseData.validation_messages || {};
						}
					} else if (operation === 'update') {
						const entryId = this.getNodeParameter('entryId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						responseData = await makeGravityFormsApiRequest.call(
							this,
							'PUT',
							`/entries/${entryId}`,
							updateFields,
						);
					} else if (operation === 'delete') {
						const entryId = this.getNodeParameter('entryId', i) as string;
						responseData = await makeGravityFormsApiRequest.call(
							this,
							'DELETE',
							`/entries/${entryId}`,
						);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData);
				} else {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}