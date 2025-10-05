import {noopAsync} from 'softkave-js-utils';
import type {MongoDBConnection} from './types.js';

export class NoopMongoDBConnection implements MongoDBConnection<undefined> {
  get = <TConnection = undefined>() => {
    return undefined as TConnection;
  };

  wait = <TConnection = undefined>() => {
    return undefined as TConnection;
  };

  close = noopAsync;
}
