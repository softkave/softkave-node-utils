import {Express, Request, Response} from 'express';
import {compact, isString} from 'lodash';
import {AnyObject, toCompactArray} from 'softkave-js-utils';
import {kUtilsInjectables} from '../contexts/injection/injectables';
import {ServerRequest} from '../contexts/types';
import {Agent} from '../definitions/agent';
import OperationError, {FimidaraExternalError} from '../errors/OperationError';
import {ServerError} from '../errors/commonErrors';
import {NotFoundError} from '../errors/endpointErrors';
import RequestData from './RequestData';
import {kEndpointConstants} from './constants';
import {
  Endpoint,
  ExportedHttpEndpointWithMddocDefinition,
  ExportedHttpEndpoint_Cleanup,
  ExportedHttpEndpoint_GetDataFromReqFn,
  ExportedHttpEndpoint_HandleErrorFn,
  ExportedHttpEndpoint_HandleResponse,
} from './types';

export function extractExternalEndpointError(
  errorItem: OperationError
): FimidaraExternalError {
  return {
    name: errorItem.name,
    message: errorItem.message,
    action: errorItem.action,
    field: errorItem.field,
    notes: errorItem.notes,
  };
}

export function getPublicErrors(inputError: unknown) {
  const errors: OperationError[] = Array.isArray(inputError)
    ? inputError
    : [inputError];

  // We are mapping errors cause some values don't show if we don't
  // or was it errors, not sure anymore, this is old code.
  // TODO: Feel free to look into it, cause it could help performance.
  const preppedErrors: FimidaraExternalError[] = [];
  errors.forEach(
    errorItem =>
      errorItem?.isPublicError &&
      preppedErrors.push(extractExternalEndpointError(errorItem))
  );

  if (preppedErrors.length === 0) {
    const serverError = new ServerError();
    preppedErrors.push(extractExternalEndpointError(serverError));
  }

  return preppedErrors;
}

export function prepareResponseError(error: unknown) {
  kUtilsInjectables.logger().error(error);
  let statusCode = kEndpointConstants.httpStatusCode.serverError;
  const errors = Array.isArray(error) ? error : [error];
  const preppedErrors = getPublicErrors(errors);

  if (errors.length > 0 && errors[0].statusCode) {
    statusCode = errors[0].statusCode;
  }

  return {statusCode, preppedErrors};
}

export const wrapEndpointREST = <EndpointType extends Endpoint>(
  endpoint: EndpointType,
  handleResponse?: ExportedHttpEndpoint_HandleResponse,
  handleError?: ExportedHttpEndpoint_HandleErrorFn,
  getData?: ExportedHttpEndpoint_GetDataFromReqFn,
  cleanup?: ExportedHttpEndpoint_Cleanup | Array<ExportedHttpEndpoint_Cleanup>
): ((req: Request, res: Response) => unknown) => {
  return async (req: Request, res: Response) => {
    await kUtilsInjectables.asyncLocalStorage().run(async () => {
      try {
        const data = await (getData ? getData(req) : req.body);
        const instData = RequestData.fromExpressRequest(
          req as unknown as ServerRequest,
          data
        );
        const result = await endpoint(instData);

        if (handleResponse) {
          await handleResponse(res, result);
        } else {
          res.status(kEndpointConstants.httpStatusCode.ok).json(result ?? {});
        }
      } catch (error: unknown) {
        const {statusCode, preppedErrors} = prepareResponseError(error);

        if (handleError) {
          const deferHandling = handleError(res, preppedErrors, error);

          if (deferHandling !== true) {
            return;
          }
        }

        const result = {errors: preppedErrors};
        res.status(statusCode).json(result);
      } finally {
        toCompactArray(cleanup).forEach(fn =>
          kUtilsInjectables.promises().forget(fn(req, res))
        );
      }
    });
  };
};

export function throwNotFound() {
  throw new NotFoundError();
}

export type ResourceWithoutAssignedAgent<T> = Omit<
  T,
  'assignedAt' | 'assignedBy'
>;
type AssignedAgent = {
  assignedBy: Agent;
  assignedAt: number;
};

export function withAssignedAgent<T extends AnyObject>(
  agent: Agent,
  item: T
): T & AssignedAgent {
  return {
    ...item,
    assignedAt: Date.now(),
    assignedBy: {
      agentId: agent.agentId,
      agentType: agent.agentType,
      agentTokenId: agent.agentTokenId,
    },
  };
}

export function withAssignedAgentList<T extends AnyObject>(
  agent: Agent,
  items: T[] = []
): Array<T & AssignedAgent> {
  return items.map(item => ({
    ...item,
    assignedAt: Date.now(),
    assignedBy: {
      agentId: agent.agentId,
      agentType: agent.agentType,
      agentTokenId: agent.agentTokenId,
    },
  }));
}

export function endpointDecodeURIComponent(component?: unknown) {
  return component && isString(component)
    ? decodeURIComponent(component)
    : undefined;
}

export function registerExpressRouteFromEndpoint(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  endpoint: ExportedHttpEndpointWithMddocDefinition<any>,
  app: Express
) {
  const p = endpoint.mddocHttpDefinition.assertGetBasePathname();
  const expressPath = endpoint.mddocHttpDefinition.getPathParamaters()
    ? `${p}*`
    : p;
  app[endpoint.mddocHttpDefinition.assertGetMethod()](
    expressPath,
    ...compact([
      endpoint.expressRouteMiddleware,
      wrapEndpointREST(
        endpoint.fn,
        endpoint.handleResponse,
        endpoint.handleError,
        endpoint.getDataFromReq,
        endpoint.cleanup
      ),
    ])
  );
}
