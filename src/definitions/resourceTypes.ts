import {padIdShortName} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';

export const kFimidaraResourceType = {
  All: '*',
  System: 'system',
  Public: 'public',
  EndpointRequest: 'endpointRequest',
  Job: 'job',
} as const;

export type FimidaraResourceType = ValueOf<typeof kFimidaraResourceType>;

export const kResourceTypeShortNames: Record<FimidaraResourceType, string> = {
  [kFimidaraResourceType.All]: padIdShortName('*'),
  [kFimidaraResourceType.System]: padIdShortName('system'),
  [kFimidaraResourceType.Public]: padIdShortName('public'),
  [kFimidaraResourceType.EndpointRequest]: padIdShortName('endrqst'),
  [kFimidaraResourceType.Job]: padIdShortName('job'),
};
