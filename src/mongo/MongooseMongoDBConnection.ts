import mongoose from 'mongoose';
import {type MongoDBConnection} from './types.js';
import {getMongooseMongoConnection} from './utils.js';

export class MongooseMongoDBConnection
  implements MongoDBConnection<mongoose.Connection>
{
  protected connection: mongoose.Connection;
  protected promise: Promise<mongoose.Connection>;

  constructor(uri: string, dbName: string) {
    const {connection, promise} = getMongooseMongoConnection(uri, dbName);
    this.connection = connection;
    this.promise = promise;
  }

  get = <TConnection = mongoose.Connection>() => {
    return this.connection as TConnection;
  };

  wait = <TConnection = mongoose.Connection>() => {
    return this.promise as Promise<TConnection>;
  };

  close = async () => {
    await this.connection.close();
  };
}
