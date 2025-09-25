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
				displayName: 'Date Created After',
				name: 'date_created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter entries created after this date',
			},
			{
				displayName: 'Date Created Before',
				name: 'date_created_before',
				type: 'dateTime',
				default: '',
				description: 'Filter entries created before this date',
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
				displayName: 'Search (JSON)',
				name: 'search',
				type: 'json',
				default: '={{ $fromAI("search", "JSON object with field filters for searching entries") }}',
				description: 'Search criteria as JSON object',
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

	// Create Operation
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
			},
		},
		description: 'Set values for form fields',
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
						description: 'Select a field from the form. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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