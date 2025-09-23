import type { INodeProperties } from 'n8n-workflow';

export const gravityFormsResources: INodeProperties[] = [
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
      {
        name: 'Tool Action',
        value: 'tool',
        description: 'High-level actions intended for AI agents',
      },
    ],
    default: 'form',
  },
];

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
        action: 'Create a form',
      },
      {
        name: 'Get',
        value: 'get',
        action: 'Get a form',
      },
      {
        name: 'List',
        value: 'getAll',
        action: 'List forms',
      },
    ],
    default: 'getAll',
  },
];

export const formFields: INodeProperties[] = [
  {
    displayName: 'Form ID',
    name: 'formId',
    type: 'string',
    required: true,
    default: '',
    description: 'Numeric ID of the form',
    displayOptions: {
      show: {
        resource: ['form'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Form JSON',
    name: 'formJson',
    type: 'json',
    default: '',
    typeOptions: {
      rows: 6,
    },
    description: 'Raw Gravity Forms form object payload',
    displayOptions: {
      show: {
        resource: ['form'],
        operation: ['create'],
      },
    },
    placeholder: '{\n  "title": "Contact",\n  "description": "Generated form"\n}',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or limit',
    displayOptions: {
      show: {
        resource: ['form'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    default: 50,
    description: 'Max number of forms to return',
    displayOptions: {
      show: {
        resource: ['form'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
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
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Active Only',
        name: 'active',
        type: 'boolean',
        default: false,
        description: 'Return only active forms',
      },
      {
        displayName: 'Trash',
        name: 'trash',
        type: 'boolean',
        default: false,
        description: 'Include only forms in trash',
      },
    ],
  },
];

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
        action: 'Create an entry submission',
      },
      {
        name: 'Delete',
        value: 'delete',
        action: 'Delete an entry',
      },
      {
        name: 'Get',
        value: 'get',
        action: 'Get an entry',
      },
      {
        name: 'List',
        value: 'getAll',
        action: 'List entries',
      },
    ],
    default: 'getAll',
  },
];

export const entryFields: INodeProperties[] = [
  {
    displayName: 'Entry ID',
    name: 'entryId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['entry'],
        operation: ['get', 'delete'],
      },
    },
    description: 'Numeric ID of the entry',
  },
  {
    displayName: 'Form ID',
    name: 'formId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['entry'],
        operation: ['create'],
      },
    },
    description: 'Form the entry belongs to',
  },
  {
    displayName: 'Submission JSON',
    name: 'submissionJson',
    type: 'json',
    default: '',
    typeOptions: {
      rows: 6,
    },
    placeholder: '{\n  "input_values": {\n    "1": "John"\n  }\n}',
    displayOptions: {
      show: {
        resource: ['entry'],
        operation: ['create'],
      },
    },
    description: 'Entry payload matching Gravity Forms submission schema',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['entry'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    default: 50,
    displayOptions: {
      show: {
        resource: ['entry'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
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
        displayName: 'Form ID',
        name: 'formId',
        type: 'string',
        default: '',
        description: 'Limit entries to a specific form',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'Spam', value: 'spam' },
          { name: 'Trash', value: 'trash' },
        ],
        default: 'active',
      },
    ],
  },
];

export const toolOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['tool'],
      },
    },
    options: [
      {
        name: 'Form Summary',
        value: 'formSummary',
        action: 'Summarise form structure',
      },
      {
        name: 'Submit Entry',
        value: 'submitEntry',
        action: 'Submit entry via tool',
      },
      {
        name: 'Find Entries',
        value: 'findEntries',
        action: 'Search entries for AI agent',
      },
    ],
    default: 'findEntries',
  },
];

export const toolFields: INodeProperties[] = [
  {
    displayName: 'Form ID',
    name: 'formId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tool'],
        operation: ['formSummary', 'submitEntry'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 5,
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    displayOptions: {
      show: {
        resource: ['tool'],
        operation: ['findEntries'],
      },
    },
  },
  {
    displayName: 'Search Term',
    name: 'searchTerm',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['tool'],
        operation: ['findEntries'],
      },
    },
    description: 'Full-text search term executed against entry content',
  },
  {
    displayName: 'Submission JSON',
    name: 'submissionJson',
    type: 'json',
    default: '',
    typeOptions: {
      rows: 5,
    },
    displayOptions: {
      show: {
        resource: ['tool'],
        operation: ['submitEntry'],
      },
    },
  },
];
