import assert from 'assert';

export function getOpinionatedMongoDBConfigFromEnv() {
  const mongoDBURI = process.env.MONGO_DB_URI;
  const mongoDBDatabaseName = process.env.MONGO_DB_DATABASE_NAME;

  assert.ok(mongoDBURI, 'MONGO_DB_URI is required');
  assert.ok(mongoDBDatabaseName, 'MONGO_DB_DATABASE_NAME is required');

  return {
    uri: mongoDBURI,
    dbName: mongoDBDatabaseName,
  };
}
