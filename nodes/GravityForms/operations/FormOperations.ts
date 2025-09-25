import { INodeProperties } from 'n8n-workflow';

export const formOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['form'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new form',
				action: 'Create a form',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a form',
				action: 'Delete a form',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a form by ID',
				action: 'Get a form',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many forms',
				action: 'Get many forms',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a form',
				action: 'Update a form',
			},
		],
		default: 'get',
	},
];

export const formFields: INodeProperties[] = [
	// Get Operation
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
				resource: ['form'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'Select a form from your Gravity Forms. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// Get All Operation
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['form'],
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
				resource: ['form'],
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

	// Create Operation
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '={{ $fromAI("title", "The title of the form") }}',
		required: true,
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create'],
			},
		},
		description: 'The title of the form',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '={{ $fromAI("description", "The description of the form") }}',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create'],
			},
		},
		description: 'The description of the form',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Button Text',
				name: 'button_text',
				type: 'string',
				default: 'Submit',
				description: 'The submit button text',
			},
			{
				displayName: 'Confirmation',
				name: 'confirmation',
				type: 'json',
				default: '{}',
				description: 'Confirmation settings as JSON',
			},
			{
				displayName: 'Fields (JSON)',
				name: 'fields',
				type: 'string',
				default: '={{ $fromAI("fields", "JSON array of form fields configuration") }}',
				description: 'Form fields configuration as JSON array',
			},
			{
				displayName: 'Is Active',
				name: 'is_active',
				type: 'boolean',
				default: true,
				description: 'Whether the form is active',
			},
			{
				displayName: 'Is Trash',
				name: 'is_trash',
				type: 'boolean',
				default: false,
				description: 'Whether the form is in trash',
			},
			{
				displayName: 'Notifications',
				name: 'notifications',
				type: 'json',
				default: '{}',
				description: 'Notification settings as JSON',
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
				resource: ['form'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Button Text',
				name: 'button_text',
				type: 'string',
				default: '',
				description: 'The submit button text',
			},
			{
				displayName: 'Confirmation',
				name: 'confirmation',
				type: 'json',
				default: '{}',
				description: 'Confirmation settings as JSON',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '={{ $fromAI("description", "The updated description of the form") }}',
				description: 'The description of the form',
			},
			{
				displayName: 'Fields (JSON)',
				name: 'fields',
				type: 'string',
				default: '={{ $fromAI("fields", "Updated JSON array of form fields configuration") }}',
				description: 'Form fields configuration as JSON array',
			},
			{
				displayName: 'Is Active',
				name: 'is_active',
				type: 'boolean',
				default: true,
				description: 'Whether the form is active',
			},
			{
				displayName: 'Is Trash',
				name: 'is_trash',
				type: 'boolean',
				default: false,
				description: 'Whether the form is in trash',
			},
			{
				displayName: 'Notifications',
				name: 'notifications',
				type: 'json',
				default: '{}',
				description: 'Notification settings as JSON',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '={{ $fromAI("title", "The updated title of the form") }}',
				description: 'The title of the form',
			},
		],
	},
];