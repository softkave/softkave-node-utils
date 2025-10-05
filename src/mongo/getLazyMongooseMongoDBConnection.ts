import {MongooseMongoDBConnection} from './MongooseMongoDBConnection.js';
import {getOpinionatedMongoDBConfigFromEnv} from './getOpinionatedMongoDBConfig.js';

let connection: MongooseMongoDBConnection | null = null;

export function getLazyMongooseMongoDBConnection(config?: {
  uri: string;
  dbName: string;
}) {
  const {uri, dbName} = config ?? getOpinionatedMongoDBConfigFromEnv();
  if (!connection) {
    connection = new MongooseMongoDBConnection(uri, dbName);
  }

  return connection;
}

export function getLazyMongooseConnection(config?: {
  uri: string;
  dbName: string;
}) {
  return getLazyMongooseMongoDBConnection(config).wait();
}
