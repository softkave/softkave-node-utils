import {getNewIdWithShortName} from 'softkave-js-utils';
import {ServerRequest} from '../contexts/types';
import {kResourceTypeShortNames} from '../definitions/resourceTypes';
import {BaseTokenData} from '../definitions/token';

export interface IRequestContructorParams<T = any> {
  req?: ServerRequest | null;
  data?: T;
  incomingTokenData?: BaseTokenData | null;
}

export default class RequestData<T = any> {
  static fromExpressRequest(req: ServerRequest): RequestData<{}>;
  static fromExpressRequest<DataType = any>(
    req: ServerRequest,
    data: DataType
  ): RequestData<DataType>;
  static fromExpressRequest<DataType = any>(
    ...args: [ServerRequest] | [ServerRequest, DataType]
  ): RequestData<DataType> {
    const [req, data] = args;
    const requestData = new RequestData({
      req,
      data,
      incomingTokenData: req.auth,
    });

    return requestData;
  }

  static clone<T = undefined>(from: RequestData, data: T): RequestData<T> {
    return new RequestData({
      data,
      req: from.req,
      incomingTokenData: from.incomingTokenData,
    });
  }

  static merge<T>(from: RequestData, to: RequestData<T>) {
    return new RequestData<T>({
      req: from.req,
      data: to.data,
      incomingTokenData: from.incomingTokenData,
    });
  }

  requestId: string;
  req?: ServerRequest | null;
  data?: T;
  incomingTokenData?: BaseTokenData | null;

  constructor(arg?: IRequestContructorParams<T>) {
    this.requestId = getNewIdWithShortName(
      kResourceTypeShortNames.endpointRequest
    );

    if (!arg) {
      return;
    }

    this.req = arg.req;
    this.data = arg.data;
    this.incomingTokenData = arg.incomingTokenData;
  }

  getIp() {
    if (this.req)
      return Array.isArray(this.req.ips) && this.req.ips.length > 0
        ? this.req.ips
        : [this.req.ip];
    return [];
  }

  getUserAgent() {
    if (this.req) return this.req.headers['user-agent'];
    return null;
  }
}
