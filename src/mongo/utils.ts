import mongoose from 'mongoose';

export function getMongooseMongoConnection(uri: string, dbName: string) {
  const connection = mongoose.createConnection(uri, {dbName, autoIndex: false});
  const promise = connection.asPromise();
  return {connection, promise};
}

export function isMongooseMongoConnection(
  connection: unknown
): connection is mongoose.Connection {
  // Not an exhaustive check, but useful enough
  return !!(connection as mongoose.Connection).collections;
}

export function isMongooseMongoClientSession(
  session: unknown
): session is mongoose.ClientSession {
  return !!(session as mongoose.ClientSession)?.toBSON;
}

// ensures all the fields defined in the type are added to the schema
// TODO: do deep check to make sure that internal schemas are checked too
// eslint-disable-next-line @typescript-eslint/ban-types
export function ensureMongoTypeFields<T extends object>(schema: {
  [path in keyof Required<T>]: mongoose.SchemaDefinitionProperty<T[path]>;
}) {
  return schema;
}
