import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class GravityFormsApi implements ICredentialType {
  name = 'gravityFormsApi';

  displayName = 'Gravity Forms API';

  documentationUrl = 'https://docs.gravityforms.com/rest-api-v2/';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
      placeholder: 'https://your-wordpress-site.com/wp-json/gf/v2',
      required: true,
      description: 'Base URL of your Gravity Forms REST API v2. Include the `/wp-json/gf/v2` prefix.',
    },
    {
      displayName: 'Consumer Key',
      name: 'consumerKey',
      type: 'string',
      default: '',
      required: true,
      description: 'Gravity Forms REST API consumer key.',
    },
    {
      displayName: 'Consumer Secret',
      name: 'consumerSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Gravity Forms REST API consumer secret.',
    },
  ];
}
