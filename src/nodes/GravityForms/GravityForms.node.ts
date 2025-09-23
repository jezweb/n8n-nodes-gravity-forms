import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
  gravityFormsResources,
  formOperations,
  formFields,
  entryOperations,
  entryFields,
  toolOperations,
  toolFields,
} from './GravityForms.descriptions';
import {
  gravityFormsApiRequest,
  gravityFormsApiRequestAllItems,
} from './helpers/GenericFunctions';

function parseJsonParameter(this: IExecuteFunctions, parameter: IDataObject | string, parameterName: string) {
  if (typeof parameter === 'string' && parameter.trim() === '') {
    throw new NodeOperationError(this.getNode(), `${parameterName} must not be empty`);
  }

  if (typeof parameter === 'string') {
    try {
      return JSON.parse(parameter);
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Invalid JSON provided for ${parameterName}: ${(error as Error).message}`);
    }
  }

  return parameter as IDataObject;
}

export class GFormsApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'GForms API',
    name: 'gFormsApi',
    icon: 'file:gravityForms.svg',
    group: ['transform', 'input'],
    version: 1,
    description: 'Interact with Gravity Forms REST API v2',
    defaults: {
      name: 'GForms API',
    },
    subtitle: '={{$parameter["operation"]}}',
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'gFormsApiAuth',
        required: true,
      },
    ],
    codex: {
      categories: ['AI', 'Automation'],
      resources: {
        primaryDocumentation: [
          {
            url: 'https://docs.gravityforms.com/rest-api-v2/',
          },
        ],
      },
    },
    properties: [
      ...gravityFormsResources,
      ...formOperations,
      ...formFields,
      ...entryOperations,
      ...entryFields,
      ...toolOperations,
      ...toolFields,
    ],
  };

  methods = {
    loadOptions: {
      async getForms(this: ILoadOptionsFunctions) {
        const response = await gravityFormsApiRequest.call(
          this,
          'GET',
          '/forms',
        );
        const forms = (response.forms as IDataObject[]) ?? [];
        return forms.map((form) => ({
          name: (form.title as string) ?? String(form.id),
          value: String(form.id),
        }));
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      try {
        if (resource === 'form') {
          if (operation === 'getAll') {
            const returnAll = this.getNodeParameter('returnAll', i);
            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
            const qs: IDataObject = {};

            if (additionalFields.active) {
              qs.active = additionalFields.active ? 1 : 0;
            }

            if (additionalFields.trash) {
              qs.status = 'trash';
            }

            let responseData: IDataObject[];

            if (returnAll === true) {
              responseData = await gravityFormsApiRequestAllItems.call(
                this,
                'forms',
                'GET',
                '/forms',
                {},
                qs,
              );
            } else {
              const limit = this.getNodeParameter('limit', i);
              qs['paging[page_size]'] = limit;
              const response = await gravityFormsApiRequest.call(this, 'GET', '/forms', {}, qs);
              responseData = ((response.forms as IDataObject[]) ?? []).slice(0, limit);
            }

            returnData.push(...this.helpers.returnJsonArray(responseData));
            continue;
          }

          if (operation === 'get') {
            const formId = this.getNodeParameter('formId', i);
            const response = await gravityFormsApiRequest.call(
              this,
              'GET',
              `/forms/${formId}`,
            );
            returnData.push({ json: response as JsonObject });
            continue;
          }

          if (operation === 'create') {
            const rawJson = this.getNodeParameter('formJson', i) as string | IDataObject;
            const body = parseJsonParameter.call(this, rawJson, 'Form JSON');
            const response = await gravityFormsApiRequest.call(
              this,
              'POST',
              '/forms',
              body,
            );
            returnData.push({ json: response as JsonObject });
            continue;
          }

          throw new NodeOperationError(this.getNode(), `Unsupported form operation: ${operation}`);
        }

        if (resource === 'entry') {
          if (operation === 'getAll') {
            const returnAll = this.getNodeParameter('returnAll', i);
            const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
            const qs: IDataObject = {};

            if (filters.formId) {
              qs['form_ids'] = filters.formId;
            }
            if (filters.startDate) {
              qs.start_date = filters.startDate;
            }
            if (filters.endDate) {
              qs.end_date = filters.endDate;
            }
            if (filters.status) {
              qs.status = filters.status;
            }

            let responseData: IDataObject[];

            if (returnAll === true) {
              responseData = await gravityFormsApiRequestAllItems.call(
                this,
                'entries',
                'GET',
                '/entries',
                {},
                qs,
              );
            } else {
              const limit = this.getNodeParameter('limit', i);
              qs['paging[page_size]'] = limit;
              const response = await gravityFormsApiRequest.call(
                this,
                'GET',
                '/entries',
                {},
                qs,
              );
              responseData = ((response.entries as IDataObject[]) ?? []).slice(0, limit);
            }

            returnData.push(...this.helpers.returnJsonArray(responseData));
            continue;
          }

          if (operation === 'get') {
            const entryId = this.getNodeParameter('entryId', i);
            const response = await gravityFormsApiRequest.call(
              this,
              'GET',
              `/entries/${entryId}`,
            );
            returnData.push({ json: response as JsonObject });
            continue;
          }

          if (operation === 'delete') {
            const entryId = this.getNodeParameter('entryId', i);
            await gravityFormsApiRequest.call(
              this,
              'DELETE',
              `/entries/${entryId}`,
            );
            returnData.push({ json: { success: true, entryId } });
            continue;
          }

          if (operation === 'create') {
            const formId = this.getNodeParameter('formId', i);
            const rawJson = this.getNodeParameter('submissionJson', i) as string | IDataObject;
            const body = parseJsonParameter.call(this, rawJson, 'Submission JSON');

            const response = await gravityFormsApiRequest.call(
              this,
              'POST',
              `/forms/${formId}/submissions`,
              body,
            );

            returnData.push({ json: response as JsonObject });
            continue;
          }

          throw new NodeOperationError(this.getNode(), `Unsupported entry operation: ${operation}`);
        }

        if (resource === 'tool') {
          if (operation === 'formSummary') {
            const formId = this.getNodeParameter('formId', i);
            const response = await gravityFormsApiRequest.call(
              this,
              'GET',
              `/forms/${formId}`,
            );
            const form = response as IDataObject;
            const summary = {
              id: form.id,
              title: form.title,
              description: form.description,
              fields: Array.isArray(form.fields)
                ? (form.fields as IDataObject[]).map((field) => ({
                    id: field.id,
                    label: field.label,
                    type: field.type,
                    required: field.isRequired,
                  }))
                : [],
            };
            returnData.push({ json: summary as JsonObject });
            continue;
          }

          if (operation === 'submitEntry') {
            const formId = this.getNodeParameter('formId', i);
            const rawJson = this.getNodeParameter('submissionJson', i) as string | IDataObject;
            const body = parseJsonParameter.call(this, rawJson, 'Submission JSON');
            const response = await gravityFormsApiRequest.call(
              this,
              'POST',
              `/forms/${formId}/submissions`,
              body,
            );
            returnData.push({ json: response as JsonObject });
            continue;
          }

          if (operation === 'findEntries') {
            const limit = this.getNodeParameter('limit', i);
            const searchTerm = this.getNodeParameter('searchTerm', i, '') as string;
            const qs: IDataObject = {
              'paging[page_size]': limit,
            };
            if (searchTerm) {
              qs.search = searchTerm;
            }

            const response = await gravityFormsApiRequest.call(
              this,
              'GET',
              '/entries',
              {},
              qs,
            );
            const entries = ((response.entries as IDataObject[]) ?? []).slice(0, limit);
            returnData.push(...this.helpers.returnJsonArray(entries));
            continue;
          }

          throw new NodeOperationError(this.getNode(), `Unsupported tool operation: ${operation}`);
        }

        throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
