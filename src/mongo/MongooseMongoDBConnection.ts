import {Connection} from 'mongoose';
import {type MongoDBConnection} from './types.js';
import {getMongooseMongoConnection} from './utils.js';

export class MongooseMongoDBConnection
  implements MongoDBConnection<Connection>
{
  protected connection: Connection;
  protected promise: Promise<Connection>;

  constructor(uri: string, dbName: string) {
    const {connection, promise} = getMongooseMongoConnection(uri, dbName);
    this.connection = connection;
    this.promise = promise;
  }

  get = <TConnection = Connection>() => {
    return this.connection as TConnection;
  };

  wait = <TConnection = Connection>() => {
    return this.promise as Promise<TConnection>;
  };

  close = async () => {
    await this.connection.close();
  };
}
