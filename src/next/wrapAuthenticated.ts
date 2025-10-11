import assert from 'assert';
import jwt from 'jsonwebtoken';
import {isString} from 'lodash-es';
import {NextRequest} from 'next/server.js';
import {type AnyFn, type AnyObject} from 'softkave-js-utils';
import {OwnServerError} from '../common/error.js';
import type {JWTTokenContent} from '../server/index.js';
import {type IRouteContext, wrapRoute} from './wrapRoute.js';

export interface JWTTokenAuthenticatedRequest {
  jwtContent: JWTTokenContent;
}

async function tryGetJWTTokenAuthenticatedRequest<
  T extends JWTTokenContent,
  TTransformJWTContent extends (decodedToken: JWTTokenContent) => Promise<T>,
>(params: {
  req: NextRequest;
  getJWTSecret: () => string;
  transformJWTContent?: TTransformJWTContent;
}): Promise<Awaited<ReturnType<TTransformJWTContent>> | null> {
  const {req, getJWTSecret, transformJWTContent} = params;
  const rawToken = req.headers.get('authorization');
  if (!rawToken) {
    return null;
  }

  const inputToken = rawToken.startsWith('Bearer ')
    ? rawToken.slice(7)
    : rawToken;
  assert.ok(isString(inputToken), new OwnServerError('Unauthorized', 401));

  try {
    const decodedToken = jwt.verify(
      inputToken,
      getJWTSecret()
    ) as JWTTokenContent;
    const authenticatedRequest: JWTTokenAuthenticatedRequest = {
      jwtContent: decodedToken,
    };
    const transformedRequest = transformJWTContent
      ? await transformJWTContent(decodedToken)
      : authenticatedRequest;
    return transformedRequest as Awaited<ReturnType<TTransformJWTContent>>;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new OwnServerError('Unauthorized', 401);
    }

    throw error;
  }
}

async function getJWTTokenAuthenticatedRequest<
  T extends JWTTokenContent,
  TTransformJWTContent extends (decodedToken: JWTTokenContent) => Promise<T>,
>(params: {
  req: NextRequest;
  getJWTSecret: () => string;
  transformJWTContent?: TTransformJWTContent;
}): Promise<Awaited<ReturnType<TTransformJWTContent>>> {
  const jwtTokenAuthenticatedRequest = await tryGetJWTTokenAuthenticatedRequest<
    T,
    TTransformJWTContent
  >(params);
  assert.ok(
    jwtTokenAuthenticatedRequest,
    new OwnServerError('Unauthorized', 401)
  );
  return jwtTokenAuthenticatedRequest;
}

export function wrapJWTTokenAuthenticated<
  T extends JWTTokenContent,
  TTransformJWTContent extends (decodedToken: JWTTokenContent) => Promise<T>,
>(params: {
  routeFn: AnyFn<
    [NextRequest, IRouteContext, Awaited<ReturnType<TTransformJWTContent>>],
    Promise<void | AnyObject>
  >;
  getJWTSecret: () => string;
  transformJWTContent?: TTransformJWTContent;
}) {
  return wrapRoute(async (req: NextRequest, ctx: IRouteContext) => {
    const jwtTokenAuthenticatedRequest = await getJWTTokenAuthenticatedRequest({
      req,
      getJWTSecret: params.getJWTSecret,
      transformJWTContent: params.transformJWTContent,
    });
    return params.routeFn(
      req,
      ctx,
      jwtTokenAuthenticatedRequest as Awaited<ReturnType<TTransformJWTContent>>
    );
  });
}
