import {Request} from 'express';
import {BaseTokenData} from '../definitions/token';

export interface ServerRequest extends Request {
  /** decoded JWT token using the expressJWT middleware */
  auth?: BaseTokenData;
}
