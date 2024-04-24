import {Express} from 'express';
import {forEach, isArray, isObject} from 'lodash';
import {ExportedHttpEndpointWithMddocDefinition} from './types';
import {registerExpressRouteFromEndpoint} from './utils';

export type AppExportedHttpEndpoints = Array<
  ExportedHttpEndpointWithMddocDefinition<any>
>;

type RecordExportedHttpEndpoints = Record<
  string,
  | ExportedHttpEndpointWithMddocDefinition<any>
  | Array<ExportedHttpEndpointWithMddocDefinition<any>>
  | /** RecordExportedHttpEndpoints */ Record<string, any>
>;

function isExportedHttpEndpoint(
  item: any
): item is ExportedHttpEndpointWithMddocDefinition {
  return (
    item &&
    (item as ExportedHttpEndpointWithMddocDefinition<any>).fn &&
    (item as ExportedHttpEndpointWithMddocDefinition<any>).mddocHttpDefinition
  );
}

export function compileEndpoints(
  endpointsMap: RecordExportedHttpEndpoints
): AppExportedHttpEndpoints {
  let endpoints: AppExportedHttpEndpoints = [];
  forEach(endpointsMap, e1 => {
    if (isExportedHttpEndpoint(e1)) {
      endpoints.push(e1);
    } else if (isArray(e1)) {
      endpoints = endpoints.concat(e1);
    } else if (isObject(e1)) {
      endpoints = endpoints.concat(compileEndpoints(e1));
    }
  });
  return endpoints;
}

export function setupAppHttpEndpoints(
  app: Express,
  endpoints: AppExportedHttpEndpoints
) {
  forEach(endpoints, e1 => {
    registerExpressRouteFromEndpoint(e1, app);
  });
}
