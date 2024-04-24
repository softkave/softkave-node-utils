import {globalSetup} from '../contexts/globalUtils';
import {ServerRequest} from '../contexts/types';
import {Resource} from '../definitions/resource';
import {BaseTokenData, kCurrentJWTTokenVersion} from '../definitions/token';
import {BaseEndpointResult} from '../endpoints/types';
import MockTestEmailProviderContext from './context/email/MockTestEmailProviderContext';

export function getTestEmailProvider() {
  return new MockTestEmailProviderContext();
}

export async function initTests() {
  await globalSetup();
}

export function assertEndpointResultOk(result?: BaseEndpointResult | void) {
  if (result?.errors?.length) {
    throw result.errors;
  }

  return true;
}

export function mockExpressRequest(token?: BaseTokenData) {
  const req: ServerRequest = {auth: token} as unknown as ServerRequest;
  return req;
}

export function mockExpressRequestWithAgentToken(
  token: Pick<Resource, 'resourceId' | 'createdAt'> & {expiresAt?: number}
) {
  const req: ServerRequest = {
    auth: {
      version: kCurrentJWTTokenVersion,
      sub: {id: token.resourceId},
      iat: token.createdAt,
      exp: token.expiresAt,
    },
  } as unknown as ServerRequest;
  return req;
}

export function mockExpressRequestForPublicAgent() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const req: ServerRequest = {};
  return req;
}
