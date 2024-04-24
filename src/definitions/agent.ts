import {AnyObject} from 'softkave-js-utils';

export interface Agent {
  agentId: string;
  agentType: string;
  agentTokenId: string;
}

export type PublicAgent = Pick<Agent, 'agentId' | 'agentType'>;
export type ConvertAgentToPublicAgent<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Agent
    ? PublicAgent
    : NonNullable<T[K]> extends AnyObject
    ? ConvertAgentToPublicAgent<NonNullable<T[K]>>
    : T[K];
};
