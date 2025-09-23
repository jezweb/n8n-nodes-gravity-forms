import type {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IPollFunctions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { gravityFormsApiRequest } from '../GravityForms/helpers/GenericFunctions';

interface TriggerStaticData extends IDataObject {
  lastEntryDate?: string;
  lastEntryId?: number;
}

export class GravityFormsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Gravity Forms Trigger',
    name: 'gravityFormsTrigger',
    icon: 'file:gravityForms.svg',
    group: ['trigger'],
    version: 1,
    description: 'Starts the workflow when new Gravity Forms entries are submitted',
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
    polling: true,
    properties: [
      {
        displayName: 'Form ID',
        name: 'formId',
        type: 'string',
        default: '',
        description: 'If set, only trigger for submissions on this form',
      },
      {
        displayName: 'Results Per Poll',
        name: 'limit',
        type: 'number',
        default: 25,
        typeOptions: {
          minValue: 1,
          maxValue: 200,
        },
        description: 'Number of entries to fetch on each poll',
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const formId = this.getNodeParameter('formId') as string;
    const limit = this.getNodeParameter('limit') as number;

    const qs: IDataObject = {
      'paging[page_size]': limit,
      status: 'active',
    };

    if (formId) {
      qs.form_ids = formId;
    }

    const staticData = this.getWorkflowStaticData('node') as TriggerStaticData;

    if (staticData.lastEntryDate) {
      qs.start_date = staticData.lastEntryDate;
    }

    let response: IDataObject;

    try {
      response = await gravityFormsApiRequest.call(this, 'GET', '/entries', {}, qs);
    } catch (error) {
      throw new NodeApiError(this.getNode(), error as JsonObject);
    }

    const entries = ((response.entries as IDataObject[]) ?? []).map((entry) => ({
      ...entry,
      id: Number(entry.id),
      date_created: entry.date_created as string,
    }));

    if (entries.length === 0) {
      return null;
    }

    entries.sort((a, b) => {
      const aTime = new Date((a.date_created as string) ?? 0).getTime();
      const bTime = new Date((b.date_created as string) ?? 0).getTime();
      if (aTime === bTime) {
        return (a.id as number) - (b.id as number);
      }
      return aTime - bTime;
    });

    let filtered = entries;
    if (staticData.lastEntryDate || staticData.lastEntryId) {
      filtered = entries.filter((entry) => {
        const entryDate = entry.date_created as string;
        const entryId = entry.id as number;

        if (!staticData.lastEntryDate) {
          return true;
        }

        const lastDate = staticData.lastEntryDate;
        const lastId = staticData.lastEntryId ?? 0;

        if (entryDate > lastDate) {
          return true;
        }

        if (entryDate === lastDate && entryId > lastId) {
          return true;
        }

        return false;
      });
    }

    if (filtered.length === 0) {
      return null;
    }

    const lastEntry = filtered[filtered.length - 1];
    staticData.lastEntryDate = lastEntry.date_created as string;
    staticData.lastEntryId = lastEntry.id as number;

    return [this.helpers.returnJsonArray(filtered as IDataObject[])];
  }
}
