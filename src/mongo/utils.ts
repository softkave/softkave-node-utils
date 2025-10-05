import {
  type ClientSession,
  type Connection,
  createConnection,
  type SchemaDefinitionProperty,
} from 'mongoose';

export function getMongooseMongoConnection(uri: string, dbName: string) {
  const connection = createConnection(uri, {dbName, autoIndex: false});
  const promise = connection.asPromise();
  return {connection, promise};
}

export function isMongooseMongoConnection(
  connection: unknown
): connection is Connection {
  // Not an exhaustive check, but useful enough
  return !!(connection as Connection).collections;
}

export function isMongooseMongoClientSession(
  session: unknown
): session is ClientSession {
  return !!(session as ClientSession)?.toBSON;
}

// ensures all the fields defined in the type are added to the schema
// TODO: do deep check to make sure that internal schemas are checked too
// eslint-disable-next-line @typescript-eslint/ban-types
export function ensureMongoTypeFields<T extends object>(schema: {
  [path in keyof Required<T>]: SchemaDefinitionProperty<T[path]>;
}) {
  return schema;
}
