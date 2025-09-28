import { INodeProperties } from 'n8n-workflow';

export const entryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['entry'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new entry',
				action: 'Create an entry',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an entry',
				action: 'Delete an entry',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an entry by ID',
				action: 'Get an entry',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many entries',
				action: 'Get many entries',
			},
			{
				name: 'Send Notification',
				value: 'sendNotification',
				description: 'Send notifications for an entry',
				action: 'Send notification',
			},
			{
				name: 'Submit',
				value: 'submit',
				description: 'Submit a form (with validation)',
				action: 'Submit a form',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an entry',
				action: 'Update an entry',
			},
		],
		default: 'get',
	},
];

export const entryFields: INodeProperties[] = [
	// Get Operation
	{
		displayName: 'Entry ID',
		name: 'entryId',
		type: 'string',
		default: '={{ $fromAI("entryId", "The ID of the entry to retrieve") }}',
		required: true,
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the entry',
	},

	// Get All Operation
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Date Range',
				name: 'dateRange',
				type: 'collection',
				placeholder: 'Add Date Filter',
				default: {},
				description: 'Filter entries by date',
				options: [
					{
						displayName: 'Date Field',
						name: 'dateField',
						type: 'options',
						options: [
							{
								name: 'Date Created',
								value: 'date_created',
							},
							{
								name: 'Date Updated',
								value: 'date_updated',
							},
						],
						default: 'date_created',
						description: 'Which date field to filter by',
					},
					{
						displayName: 'Date From',
						name: 'dateFrom',
						type: 'dateTime',
						default: '',
						description: 'Start date for the range',
					},
					{
						displayName: 'Date To',
						name: 'dateTo',
						type: 'dateTime',
						default: '',
						description: 'End date for the range',
					},
					{
						displayName: 'Quick Range',
						name: 'quickRange',
						type: 'options',
						options: [
							{
								name: 'Custom',
								value: 'custom',
							},
							{
								name: 'Last 24 Hours',
								value: 'last24Hours',
							},
							{
								name: 'Last 30 Days',
								value: 'last30Days',
							},
							{
								name: 'Last 7 Days',
								value: 'last7Days',
							},
							{
								name: 'This Month',
								value: 'thisMonth',
							},
							{
								name: 'This Week',
								value: 'thisWeek',
							},
							{
								name: 'This Year',
								value: 'thisYear',
							},
							{
								name: 'Today',
								value: 'today',
							},
							{
								name: 'Yesterday',
								value: 'yesterday',
							},
						],
						default: 'custom',
						description: 'Quick date range presets',
					},
				],
			},
			{
				displayName: 'Field Filters',
				name: 'fieldFilters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Filter',
				default: {},
				description: 'Filter entries by field values',
				options: [
					{
						name: 'filter',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Field Name or ID',
								name: 'fieldId',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFormFields',
									loadOptionsDependsOn: ['filters.formId'],
								},
								default: '',
								description: 'Field to filter by. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{
										name: 'Contains',
										value: 'contains',
									},
									{
										name: 'Equals',
										value: '=',
									},
									{
										name: 'Greater Than',
										value: '>',
									},
									{
										name: 'Greater Than or Equal',
										value: '>=',
									},
									{
										name: 'Is',
										value: 'is',
									},
									{
										name: 'Is Not',
										value: 'isnot',
									},
									{
										name: 'Less Than',
										value: '<',
									},
									{
										name: 'Less Than or Equal',
										value: '<=',
									},
									{
										name: 'Not Equals',
										value: '!=',
									},
								],
								default: '=',
								description: 'How to compare the field value',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to filter by',
							},
						],
					},
				],
			},
			{
				displayName: 'Form Name or ID',
				name: 'formId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getForms',
				},
				default: '',
				description: 'Filter entries by form. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Search (Advanced JSON)',
				name: 'search',
				type: 'json',
				default: '={{ $fromAI("search", "JSON object with field filters for searching entries") }}',
				description: 'Advanced search criteria as JSON object (overrides field filters if provided)',
			},
			{
				displayName: 'Status',
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
				],
				default: 'active',
				description: 'Filter entries by status',
			},
		],
	},

	// Send Notification Operation
	{
		displayName: 'Entry ID',
		name: 'entryId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['sendNotification'],
			},
		},
		description: 'The ID of the entry to send notifications for',
	},
	{
		displayName: 'Notification Options',
		name: 'notificationOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['sendNotification'],
			},
		},
		options: [
			{
				displayName: 'BCC Email',
				name: 'bccEmail',
				type: 'string',
				default: '',
				description: 'BCC email addresses (comma-separated)',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Form Submission',
						value: 'form_submission',
					},
					{
						name: 'Manual',
						value: 'manual',
					},
				],
				default: 'manual',
				description: 'The event type for the notification',
			},
			{
				displayName: 'From Email Override',
				name: 'fromEmail',
				type: 'string',
				default: '',
				description: 'Override the sender email address',
			},
			{
				displayName: 'Message Override',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'Override the notification message',
			},
			{
				displayName: 'Notification IDs',
				name: 'notificationIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of notification IDs to send. Leave empty to send all configured notifications.',
			},
			{
				displayName: 'Subject Override',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Override the email subject',
			},
			{
				displayName: 'To Email Override',
				name: 'toEmail',
				type: 'string',
				default: '',
				description: 'Override the recipient email address',
			},
		],
	},

	// Create Operation - Form Selection (MOVED OUTSIDE for proper dependency)
	{
		displayName: 'Form Name or ID',
		name: 'formId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getForms',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
			},
		},
		description: 'Select the form to submit an entry to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// Field Input Method Selection for Create
	{
		displayName: 'Field Input Method',
		name: 'fieldInputMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Field Builder',
				value: 'fieldBuilder',
				description: 'Use the visual field builder to set values',
			},
			{
				name: 'JSON',
				value: 'json',
				description: 'Provide field values as a JSON object',
			},
		],
		default: 'fieldBuilder',
		description: 'How to input field values',
	},

	// Field Builder Method
	{
		displayName: 'Field Values',
		name: 'fields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Field Value',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
				fieldInputMethod: ['fieldBuilder'],
			},
		},
		description: 'Set values for form fields',
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field ID',
						name: 'fieldId',
						type: 'string',
						default: '',
						placeholder: 'e.g. 1',
						description: 'The field ID number. You can find these in your Gravity Forms form editor.',
						hint: 'Enter the field ID (e.g., 1, 2, 3). Use the Field Reference below to see available fields.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value for this field',
					},
				],
			},
		],
	},

	// Field Reference Helper (shows available fields)
	{
		displayName: 'Field Reference Name or ID',
		name: 'fieldReference',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getFormFields',
			loadOptionsDependsOn: ['formId'],
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
				fieldInputMethod: ['fieldBuilder'],
			},
		},
		description: 'Reference only - shows available fields for the selected form. The selected value here is not used. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		hint: 'This dropdown shows available fields. Note the field IDs and use them in the Field Values section above.',
	},

	// JSON Method
	{
		displayName: 'Field Values (JSON)',
		name: 'fieldsJson',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
				fieldInputMethod: ['json'],
			},
		},
		description: 'Field values as JSON object with field IDs as keys (e.g., {"1": "John Doe", "2": "john@example.com"})',
		placeholder: '{"1": "value1", "2": "value2"}',
	},

	// File Upload Fields for Create
	{
		displayName: 'File Upload Fields',
		name: 'fileFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add File Upload',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
			},
		},
		description: 'Upload files to file upload fields. Supports both binary data and URLs.',
		options: [
			{
				name: 'file',
				displayName: 'File Upload',
				values: [
					{
						displayName: 'Field ID',
						name: 'fieldId',
						type: 'string',
						default: '',
						placeholder: 'e.g. 5',
						description: 'The field ID of the file upload field',
						hint: 'Enter the field ID number for the file upload field',
					},
					{
						displayName: 'File Source',
						name: 'fileInputType',
						type: 'options',
						options: [
							{
								name: 'Binary Data',
								value: 'binary',
								description: 'Use file from previous node',
							},
							{
								name: 'URL',
								value: 'url',
								description: 'Download file from URL',
							},
						],
						default: 'binary',
						description: 'Whether to use binary data from a previous node or download from a URL',
					},
					{
						displayName: 'Binary Property',
						name: 'binaryProperty',
						type: 'string',
						default: 'data',
						displayOptions: {
							show: {
								fileInputType: ['binary'],
							},
						},
						description: 'Name of the binary property containing the file data',
					},
					{
						displayName: 'File URL',
						name: 'fileUrl',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								fileInputType: ['url'],
							},
						},
						placeholder: 'https://example.com/file.pdf',
						description: 'URL of the file to upload (S3, Google Drive, Dropbox, etc.)',
					},
				],
			},
		],
	},

	// Additional Fields for Create
	{
		displayName: 'Additional Fields',
		name: 'entryFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
			},
		},
		description: 'Additional entry metadata',
		options: [
			{
				displayName: 'Created By',
				name: 'created_by',
				type: 'string',
				default: '',
				description: 'User ID who created the entry',
			},
			{
				displayName: 'IP Address',
				name: 'ip',
				type: 'string',
				default: '={{ $fromAI("ip", "The IP address of the submitter") }}',
				description: 'The IP address of the submitter',
			},
			{
				displayName: 'Is Read',
				name: 'is_read',
				type: 'boolean',
				default: false,
				description: 'Whether the entry is read',
			},
			{
				displayName: 'Is Starred',
				name: 'is_starred',
				type: 'boolean',
				default: false,
				description: 'Whether the entry is starred',
			},
			{
				displayName: 'Source URL',
				name: 'source_url',
				type: 'string',
				default: '={{ $fromAI("sourceUrl", "The URL where the form was submitted from") }}',
				description: 'The URL where the form was submitted from',
			},
			{
				displayName: 'Status',
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
				],
				default: 'active',
				description: 'The status of the entry',
			},
			{
				displayName: 'User Agent',
				name: 'user_agent',
				type: 'string',
				default: '',
				description: 'The user agent string',
			},
		],
	},

	// Submit Operation (Form Submission with Validation)
	{
		displayName: 'Form Name or ID',
		name: 'formId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getForms',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['submit'],
			},
		},
		description: 'Select the form to submit. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Form Fields',
		name: 'submissionFields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['submit'],
			},
		},
		description: 'Values for form fields. The submission will be validated.',
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFormFields',
							loadOptionsDependsOn: ['formId'],
						},
						default: '',
						description: 'Select a field. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '={{ $fromAI("value", "The value for this field") }}',
						description: 'The value to submit for this field',
					},
				],
			},
		],
	},
	{
		displayName: 'Submission Options',
		name: 'submissionOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['submit'],
			},
		},
		options: [
			{
				displayName: 'Source Page',
				name: 'source_page',
				type: 'number',
				default: 1,
				description: 'The source page number for multi-page forms',
			},
			{
				displayName: 'Target Page',
				name: 'target_page',
				type: 'number',
				default: 0,
				description: 'The target page number (0 = submit form)',
			},
			{
				displayName: 'Field Values (JSON)',
				name: 'field_values',
				type: 'json',
				default: '{}',
				description: 'Additional field values as JSON object (alternative to using the Field UI above)',
			},
		],
	},
	{
		displayName: 'File Upload Fields',
		name: 'fileUploads',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add File Upload',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['submit'],
			},
		},
		description: 'Upload files to file upload fields. Supports both binary data and URLs.',
		options: [
			{
				name: 'file',
				displayName: 'File Upload',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFormFields',
							loadOptionsDependsOn: ['formId'],
						},
						default: '',
						description: 'Select a file upload field. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'File Source',
						name: 'fileInputType',
						type: 'options',
						options: [
							{
								name: 'Binary Data',
								value: 'binary',
								description: 'Use file from previous node',
							},
							{
								name: 'URL',
								value: 'url',
								description: 'Download file from URL',
							},
						],
						default: 'binary',
						description: 'Whether to use binary data from a previous node or download from a URL',
					},
					{
						displayName: 'Binary Property',
						name: 'binaryProperty',
						type: 'string',
						default: 'data',
						displayOptions: {
							show: {
								fileInputType: ['binary'],
							},
						},
						description: 'Name of the binary property containing the file data',
					},
					{
						displayName: 'File URL',
						name: 'fileUrl',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								fileInputType: ['url'],
							},
						},
						placeholder: 'https://example.com/file.pdf',
						description: 'URL of the file to upload (S3, Google Drive, Dropbox, etc.)',
					},
				],
			},
		],
	},

	// Update Operation
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Field Values (JSON)',
				name: 'fieldValues',
				type: 'json',
				default: '={{ $fromAI("fieldValues", "Updated JSON object with field IDs as keys and new values") }}',
				description: 'Updated field values as JSON object',
			},
			{
				displayName: 'IP Address',
				name: 'ip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Is Read',
				name: 'is_read',
				type: 'boolean',
				default: false,
				description: 'Whether the entry is read',
			},
			{
				displayName: 'Is Starred',
				name: 'is_starred',
				type: 'boolean',
				default: false,
				description: 'Whether the entry is starred',
			},
			{
				displayName: 'Status',
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
				],
				default: 'active',
				description: 'The status of the entry',
			},
			{
				displayName: 'User Agent',
				name: 'user_agent',
				type: 'string',
				default: '',
				description: 'The user agent string',
			},
		],
	},
];