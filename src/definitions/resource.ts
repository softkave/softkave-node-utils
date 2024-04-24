import {Agent, ConvertAgentToPublicAgent} from './agent';

export interface Resource {
  resourceId: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastUpdatedBy?: Agent;
  createdBy?: Agent;
  deletedBy?: Agent;
  isDeleted: boolean;
  deletedAt?: number;
}

export interface ResourceWrapper<T extends Resource = Resource> {
  resourceId: string;
  resourceType: string;
  resource: T;
}

export type PublicResource = ConvertAgentToPublicAgent<Resource>;
