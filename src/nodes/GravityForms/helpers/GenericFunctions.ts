import type {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  ILoadOptionsFunctions,
  IPollFunctions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const PAGINATION_PAGE_SIZE = 100;

type GravityFormsRequestContext =
  | IExecuteFunctions
  | ILoadOptionsFunctions
  | IPollFunctions
  | IHookFunctions;

export async function gravityFormsApiRequest(
  this: GravityFormsRequestContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  option: IDataObject = {},
): Promise<JsonObject> {
  const credentials = await this.getCredentials('gravityFormsApi');

  if (!credentials) {
    throw new NodeApiError(this.getNode(), {
      message: 'No credentials returned for Gravity Forms API',
    });
  }

  const baseUrl = ((credentials.baseUrl as string) || '').replace(/\/?$/, '');
  const url = `${baseUrl}${endpoint}`;
  const authValue = Buffer.from(
    `${credentials.consumerKey}:${credentials.consumerSecret}`,
  ).toString('base64');

  const options: IHttpRequestOptions = {
    method,
    url,
    json: true,
    qs,
    headers: {
      Authorization: `Basic ${authValue}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    ...option,
  };

  if (Object.keys(body).length === 0) {
    delete options.body;
  }

  if (Object.keys(qs).length === 0) {
    delete options.qs;
  }

  try {
    return (await this.helpers.httpRequest(options)) as JsonObject;
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

export async function gravityFormsApiRequestAllItems(
  this: GravityFormsRequestContext,
  propertyName: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let currentPage = 1;

  do {
    const requestQs = {
      ...qs,
      'paging[page_size]': qs['paging[page_size]'] ?? PAGINATION_PAGE_SIZE,
      'paging[current_page]': currentPage,
    } as IDataObject;

    const response = await gravityFormsApiRequest.call(
      this,
      method,
      endpoint,
      body,
      requestQs,
    );

    const data = response[propertyName];

    if (Array.isArray(data)) {
      returnData.push(...(data as IDataObject[]));
    } else if (data) {
      returnData.push(data as IDataObject);
    }

    const paging = (response.paging ?? {}) as IDataObject;
    const totalCount = (paging.total_count as number) ?? returnData.length;
    const pageSize = ((requestQs['paging[page_size]'] as number) ?? PAGINATION_PAGE_SIZE) || PAGINATION_PAGE_SIZE;

    if (!paging || totalCount <= currentPage * pageSize || data === undefined) {
      break;
    }

    currentPage += 1;
  } while (true);

  return returnData;
}
