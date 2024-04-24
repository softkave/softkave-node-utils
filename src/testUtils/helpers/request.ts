import {ServerRequest} from '../../contexts';
import {
  BaseTokenData,
  Resource,
  kCurrentJWTTokenVersion,
} from '../../definitions';

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
