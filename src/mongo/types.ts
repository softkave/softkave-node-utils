export interface MongoDBConnection<T = unknown> {
  get: <TConnection = T>() => TConnection;
  wait: <TConnection = T>() => Promise<TConnection>;
  close: () => Promise<void>;
}
