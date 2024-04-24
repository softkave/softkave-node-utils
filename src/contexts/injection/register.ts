import 'reflect-metadata';

import assert from 'assert';
import {isFunction} from 'lodash';
import {
  AnyFn,
  DisposableResource,
  DisposablesStore,
  LockStore,
  PromiseStore,
} from 'softkave-js-utils';
import {container} from 'tsyringe';
import {
  DbConnection,
  MongoDbConnection,
  isMongoConnection,
} from '../../mongodb/connection';
import NoopEmailProviderContext from '../../testUtils/context/email/NoopEmailProviderContext';
import SessionContext, {SessionContextType} from '../SessionContext';
import {
  AsyncLocalStorageUtils,
  kAsyncLocalStorageUtils,
} from '../asyncLocalStorage';
import {
  FimidaraSuppliedConfig,
  getSuppliedConfig,
  kFimidaraConfigEmailProvider,
  kFimidaraConfigSecretsManagerProvider,
} from '../config';
import {MongoDataProviderUtils} from '../data/MongoDataProviderUtils';
import {DataProviderUtils} from '../data/types';
import {SESEmailProviderContext} from '../email/SESEmailProviderContext';
import {IEmailProviderContext} from '../email/types';
import {AWSSecretsManagerProvider} from '../encryption/AWSSecretsManagerProvider';
import {MemorySecretsManagerProvider} from '../encryption/MemorySecretsManagerProvider';
import {SecretsManagerProvider} from '../encryption/types';
import {Logger} from '../logger/types';
import {getLogger} from '../logger/utils';
import {SemanticProviderUtils} from '../semantic/types';
import {DataSemanticProviderUtils} from '../semantic/utils';
import {kUtilsInjectables} from './injectables';
import {kInjectionKeys} from './keys';

function registerToken(
  token: string,
  item: unknown,
  use: 'value' | 'factory' = 'value'
) {
  if (use === 'factory') {
    assert(isFunction(item));
    container.register(token, {useFactory: item as AnyFn});
  } else {
    if (isFunction((item as DisposableResource | undefined)?.dispose)) {
      kUtilsInjectables.disposables().add(item as DisposableResource);
    }

    container.register(token, {useValue: item});
  }
}

export const kRegisterSemanticModels = {
  utils: (item: SemanticProviderUtils) =>
    registerToken(kInjectionKeys.semantic.utils, item),
};

export const kRegisterDataModels = {
  utils: (item: DataProviderUtils) =>
    registerToken(kInjectionKeys.data.utils, item),
};

export const kRegisterUtilsInjectables = {
  // config: (item: FimidaraConfig) => register(kInjectionKeys.config, item),
  suppliedConfig: (item: FimidaraSuppliedConfig) =>
    registerToken(kInjectionKeys.suppliedConfig, item),
  secretsManager: (item: SecretsManagerProvider) =>
    registerToken(kInjectionKeys.secretsManager, item),
  asyncLocalStorage: (item: AsyncLocalStorageUtils) =>
    registerToken(kInjectionKeys.asyncLocalStorage, item),
  session: (item: SessionContextType) =>
    registerToken(kInjectionKeys.session, item),
  mongoConnection: (item: DbConnection) =>
    registerToken(kInjectionKeys.dbConnection, item),
  email: (item: IEmailProviderContext) =>
    registerToken(kInjectionKeys.email, item),
  promises: (item: PromiseStore) =>
    registerToken(kInjectionKeys.promises, item),
  locks: (item: LockStore) => registerToken(kInjectionKeys.locks, item),
  disposables: (item: DisposablesStore) =>
    registerToken(kInjectionKeys.disposables, item),
  logger: (item: Logger) => registerToken(kInjectionKeys.logger, item),
};

export function registerDataModelInjectables() {
  const connection = kUtilsInjectables.dbConnection().get();
  assert(isMongoConnection(connection));
  kRegisterDataModels.utils(new MongoDataProviderUtils());
}

export function registerSemanticModelInjectables() {
  kRegisterSemanticModels.utils(new DataSemanticProviderUtils());
}

export function registerUtilsInjectables() {
  const suppliedConfig = getSuppliedConfig();

  const promiseStore = new PromiseStore();
  kRegisterUtilsInjectables.suppliedConfig(suppliedConfig);
  kRegisterUtilsInjectables.promises(promiseStore);
  kRegisterUtilsInjectables.disposables(new DisposablesStore(promiseStore));
  kRegisterUtilsInjectables.asyncLocalStorage(kAsyncLocalStorageUtils);
  kRegisterUtilsInjectables.locks(new LockStore());
  kRegisterUtilsInjectables.session(new SessionContext());
  kRegisterUtilsInjectables.logger(getLogger(suppliedConfig.loggerType));

  assert(suppliedConfig.mongoDbURI);
  assert(suppliedConfig.mongoDbDatabaseName);
  kRegisterUtilsInjectables.mongoConnection(
    new MongoDbConnection(
      suppliedConfig.mongoDbURI,
      suppliedConfig.mongoDbDatabaseName
    )
  );

  if (suppliedConfig.emailProvider === kFimidaraConfigEmailProvider.ses) {
    assert(suppliedConfig.awsConfig?.accessKeyId);
    assert(suppliedConfig.awsConfig?.region);
    assert(suppliedConfig.awsConfig?.secretAccessKey);
    kRegisterUtilsInjectables.email(
      new SESEmailProviderContext(suppliedConfig.awsConfig)
    );
  } else {
    kRegisterUtilsInjectables.email(new NoopEmailProviderContext());
  }

  if (
    suppliedConfig.secretsManagerProvider ===
    kFimidaraConfigSecretsManagerProvider.awsSecretsManager
  ) {
    assert(suppliedConfig.awsConfig?.accessKeyId);
    assert(suppliedConfig.awsConfig?.region);
    assert(suppliedConfig.awsConfig?.secretAccessKey);
    kRegisterUtilsInjectables.secretsManager(
      new AWSSecretsManagerProvider(suppliedConfig.awsConfig)
    );
  } else {
    kRegisterUtilsInjectables.secretsManager(
      new MemorySecretsManagerProvider()
    );
  }
}

export function registerInjectables() {
  registerUtilsInjectables();
  registerDataModelInjectables();
  registerSemanticModelInjectables();
}
