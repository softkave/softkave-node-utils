function dataKey(name: string) {
  return `data_${name}`;
}

function semanticKey(name: string) {
  return `semantic_${name}`;
}

export const kInjectionKeys = {
  data: {
    utils: dataKey('utils'),
  },
  semantic: {
    utils: semanticKey('utils'),
  },
  encryption: 'encryption',
  // config: 'config',
  suppliedConfig: 'suppliedConfig',
  runtimeConfig: 'runtimeConfig',
  secretsManager: 'secretsManager',
  fileProviderResolver: 'fileProviderResolver',
  asyncLocalStorage: 'asyncLocalStorage',
  session: 'session',
  dbConnection: 'dbConnection',
  email: 'email',
  promises: 'promises',
  locks: 'locks',
  disposables: 'disposables',
  usageLogic: 'usageLogic',
  logger: 'logger',
};
