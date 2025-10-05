import {AssertionError} from 'assert';
import type {NextRequest} from 'next/server.js';
import type {AnyFn} from 'softkave-js-utils';
import {ZodError} from 'zod';
import {OwnError, OwnServerError} from '../common/error.js';
import {fimidxConsoleLogger} from '../common/index.js';

export interface IRouteContext<T = unknown> {
  params: Promise<T>;
}

export const wrapRoute =
  <TRequest extends NextRequest>(routeFn: AnyFn) =>
  async (req: TRequest, ctx: IRouteContext) => {
    try {
      // fimidxConsoleLogger.info("Route called", {
      //   path: req.nextUrl.pathname,
      //   method: req.method,
      //   params: ctx.params,
      // });
      let result = await routeFn(req, ctx);
      result = result || {};
      return Response.json(result, {
        status: 200,
      });
    } catch (error) {
      fimidxConsoleLogger.error(error);

      if (OwnServerError.isOwnServerError(error)) {
        return Response.json(
          {message: error.message, name: 'OwnServerError'},
          {status: error.statusCode}
        );
      } else if (OwnError.isOwnError(error)) {
        return Response.json(
          {message: error.message, name: 'OwnError'},
          {status: 500}
        );
      } else if (error instanceof ZodError) {
        const formattedErrors = error.format();
        return Response.json(
          {message: formattedErrors, name: 'ZodError'},
          {status: 400}
        );
      } else if (error instanceof AssertionError) {
        return Response.json(
          {message: error.message, name: 'AssertionError'},
          {status: 400}
        );
      }

      return Response.json(
        {message: 'Internal Server Error', name: 'UnknownError'},
        {status: 500}
      );
    }
  };
