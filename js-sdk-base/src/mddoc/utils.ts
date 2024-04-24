import axios, {
  AxiosProgressEvent,
  AxiosResponse,
  Method,
  toFormData,
} from 'axios';
import {isArray, isObject, isString} from 'lodash';
import {kDefaultServerURL} from '../constants';

export type EndpointHeaders = {
  [key: string]: string | string[] | number | boolean | null;
};

type SoftkaveMddocEndpointErrorItem = {
  name: string;
  message: string;
  field?: string;

  // TODO: find a way to include in generated doc for when we add new
  // recommended actions
  action?: 'logout' | 'loginAgain' | 'requestChangePassword';
};

export class SoftkaveMddocEndpointError extends Error {
  name = 'SoftkaveMddocEndpointError';
  isSoftkaveMddocEndpointError = true;

  constructor(
    public errors: Array<SoftkaveMddocEndpointErrorItem>,
    public statusCode?: number,
    public statusText?: string,
    public headers?: EndpointHeaders
  ) {
    super(errors.map(item => item.message).join('\n') || 'Endpoint error');
  }
}

export interface SoftkaveMddocJsConfigOptions {
  authToken?: string;
  serverURL?: string;
}

export class SoftkaveMddocJsConfig {
  protected inheritors: SoftkaveMddocJsConfig[] = [];

  constructor(
    protected config: SoftkaveMddocJsConfigOptions = {},
    protected inheritConfigFrom?: SoftkaveMddocJsConfig
  ) {
    inheritConfigFrom?.registerSdkConfigInheritor(this);
  }

  setSdkAuthToken(token: string) {
    this.setSdkConfig({authToken: token});
  }

  setSdkConfig(update: Partial<SoftkaveMddocJsConfigOptions>) {
    this.config = {...this.config, ...update};
    this.fanoutSdkConfigUpdate(update);
  }

  getSdkConfig() {
    return this.config;
  }

  protected registerSdkConfigInheritor(inheritor: SoftkaveMddocJsConfig) {
    this.inheritors.push(inheritor);
  }

  protected fanoutSdkConfigUpdate(
    update: Partial<SoftkaveMddocJsConfigOptions>
  ) {
    this.inheritors.forEach(inheritor => inheritor.setSdkConfig(update));
  }
}

const HTTP_HEADER_CONTENT_TYPE = 'content-type';
const HTTP_HEADER_AUTHORIZATION = 'authorization';
const CONTENT_TYPE_APPLICATION_JSON = 'application/json';

export interface InvokeEndpointParams {
  serverURL?: string;
  token?: string;
  data?: any;
  formdata?: any;
  path: string;
  headers?: EndpointHeaders;
  query?: AnyObject;
  method: Method;
  responseType: 'blob' | 'json' | 'stream';
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export async function invokeEndpoint(props: InvokeEndpointParams) {
  const {
    data,
    path,
    headers,
    method,
    token,
    formdata,
    serverURL,
    responseType,
    query,
    onDownloadProgress,
    onUploadProgress,
  } = props;
  const incomingHeaders = {...headers};
  let contentBody = undefined;

  if (formdata) {
    contentBody = toFormData(formdata);
  } else if (data) {
    contentBody = data;
  }

  if (token) {
    incomingHeaders[HTTP_HEADER_AUTHORIZATION] = `Bearer ${token}`;
  }

  const endpointURL = (serverURL || kDefaultServerURL) + path;

  try {
    /**
     * Axios accepts the following:
     * - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
     * - Browser only: FormData, File, Blob
     * - Node only: Stream, Buffer
     *
     * TODO: enforce environment dependent options or have a universal
     * transformRequest
     */
    const result = await axios({
      method,
      responseType,
      onUploadProgress,
      onDownloadProgress,
      params: query,
      url: endpointURL,
      headers: incomingHeaders,
      data: contentBody,
      maxRedirects: 0, // avoid buffering the entire stream
    });

    return result;
  } catch (axiosError: unknown) {
    let errors: SoftkaveMddocEndpointErrorItem[] = [];
    let statusCode: number | undefined = undefined;
    let statusText: string | undefined = undefined;
    let responseHeaders: EndpointHeaders | undefined = undefined;

    if ((axiosError as any).response) {
      // The request was made and the server responded with a status code that
      // falls out of the range of 2xx
      const response = (axiosError as any).response as AxiosResponse;
      // console.log(response.data);
      // console.log(response.status);
      // console.log(response.headers);

      statusCode = response.status;
      statusText = response.statusText;
      responseHeaders = response.headers as EndpointHeaders;

      const contentType = response.headers[HTTP_HEADER_CONTENT_TYPE];
      const isResultJSON =
        isString(contentType) &&
        contentType.includes(CONTENT_TYPE_APPLICATION_JSON);

      if (isResultJSON && isString(response.data)) {
        const body = JSON.parse(response.data);
        if (isArray(body?.errors)) errors = body.errors;
      } else if (
        isObject(response.data) &&
        isArray((response.data as any).errors)
      ) {
        errors = (response.data as any).errors;
      }
    } else if ((axiosError as any).request) {
      // The request was made but no response was received `error.request` is an
      // instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      // console.log('Error', error.message);
    }

    // TODO: show axios and network errors
    throw new SoftkaveMddocEndpointError(
      errors,
      statusCode,
      statusText,
      responseHeaders
    );
  }
}

export type AnyObject = {[k: string | number | symbol]: any};
export type Mapping = Record<
  string,
  readonly ['header' | 'path' | 'query' | 'body', string]
>;

export class SoftkaveMddocEndpointsBase extends SoftkaveMddocJsConfig {
  protected getAuthToken(params?: {authToken?: string}) {
    return params?.authToken || this.config.authToken;
  }

  protected getServerURL(params?: {serverURL?: string}) {
    return params?.serverURL || this.config.serverURL;
  }

  protected applyMapping(
    endpointPath: string,
    data?: AnyObject,
    mapping?: Mapping
  ) {
    const headers: AnyObject = {};
    const query: AnyObject = {};
    let body: AnyObject = {};

    if (mapping && data) {
      Object.keys(data).forEach(key => {
        const value = data[key];
        const [mapTo, field] = mapping[key] ?? [];

        switch (mapTo) {
          case 'header': {
            headers[field] = value;
            break;
          }

          case 'query': {
            query[field] = value;
            break;
          }

          case 'path': {
            endpointPath = endpointPath.replace(
              `:${field}`,
              encodeURIComponent(value)
            );
            break;
          }

          case 'body':
          default: // do nothing
            body[field] = value;
        }
      });
    } else if (data) {
      body = data;
    }

    return {headers, query, endpointPath, data: body};
  }

  protected async executeRaw(
    p01: InvokeEndpointParams,
    p02?: Pick<
      SoftkaveMddocEndpointParamsOptional<any>,
      'authToken' | 'serverURL'
    >,
    mapping?: Mapping
  ): Promise<SoftkaveMddocEndpointResult<any>> {
    const {headers, query, data, endpointPath} = this.applyMapping(
      p01.path,
      p01.data || p01.formdata,
      mapping
    );

    if (endpointPath.includes('/:')) {
      console.log(`invalid path ${endpointPath}, params not injected`);
      throw new Error('SDK error');
    }

    const response = await invokeEndpoint({
      query,
      headers,
      data: p01.data ? data : undefined,
      formdata: p01.formdata ? data : undefined,
      serverURL: this.getServerURL(p02),
      token: this.getAuthToken(p02),
      path: endpointPath,
      method: p01.method,
      responseType: p01.responseType,
      onDownloadProgress: p01.onUploadProgress,
      onUploadProgress: p01.onDownloadProgress,
    });
    return {
      status: response.status,
      statusText: response.statusText,
      body: response.data,
      headers: response.headers as EndpointHeaders,
    };
  }

  protected async executeJson(
    p01: Pick<InvokeEndpointParams, 'data' | 'formdata' | 'path' | 'method'>,
    p02?: Pick<
      SoftkaveMddocEndpointParamsOptional<any>,
      'authToken' | 'serverURL'
    >,
    mapping?: Mapping
  ) {
    return await this.executeRaw({...p01, responseType: 'json'}, p02, mapping);
  }
}

export type SoftkaveMddocEndpointResult<T> = {
  status: number;
  statusText: string;
  body: T;
  headers: EndpointHeaders;
};
export type SoftkaveMddocEndpointProgressEvent = AxiosProgressEvent;
export type SoftkaveMddocEndpointParamsRequired<T> = {
  body: T;
  serverURL?: string;
  authToken?: string;

  /** **NOTE**: doesn't work in Node.js at the moment. */
  onUploadProgress?: (
    progressEvent: SoftkaveMddocEndpointProgressEvent
  ) => void;
  onDownloadProgress?: (
    progressEvent: SoftkaveMddocEndpointProgressEvent
  ) => void;
};
export type SoftkaveMddocEndpointWithBinaryResponseParamsRequired<T> =
  SoftkaveMddocEndpointParamsRequired<T> & {
    responseType: 'blob' | 'stream';
  };
export type SoftkaveMddocEndpointParamsOptional<T> = Partial<
  SoftkaveMddocEndpointParamsRequired<T>
>;
export type SoftkaveMddocEndpointWithBinaryResponseParamsOptional<T> =
  SoftkaveMddocEndpointParamsOptional<T> & {
    responseType: 'blob' | 'stream';
  };
