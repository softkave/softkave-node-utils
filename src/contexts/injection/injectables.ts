import 'reflect-metadata';

import {DisposablesStore, LockStore, PromiseStore} from 'softkave-js-utils';
import {container} from 'tsyringe';
import {DbConnection} from '../../mongodb/connection';
import {SessionContextType} from '../SessionContext';
import {AsyncLocalStorageUtils} from '../asyncLocalStorage';
import {FimidaraSuppliedConfig} from '../config';
import {DataProviderUtils} from '../data/types';
import {IEmailProviderContext} from '../email/types';
import {SecretsManagerProvider} from '../encryption/types';
import {Logger} from '../logger/types';
import {SemanticProviderUtils} from '../semantic/types';
import {kInjectionKeys} from './keys';

export const kSemanticModels = {
  utils: () =>
    container.resolve<SemanticProviderUtils>(kInjectionKeys.semantic.utils),
};

export const kDataModels = {
  utils: () => container.resolve<DataProviderUtils>(kInjectionKeys.data.utils),
};

export const kUtilsInjectables = {
  // config: () => container.resolve<FimidaraConfig>(kInjectionKeys.config),
  suppliedConfig: () =>
    container.resolve<FimidaraSuppliedConfig>(kInjectionKeys.suppliedConfig),
  secretsManager: () =>
    container.resolve<SecretsManagerProvider>(kInjectionKeys.secretsManager),
  asyncLocalStorage: () =>
    container.resolve<AsyncLocalStorageUtils>(kInjectionKeys.asyncLocalStorage),
  session: () => container.resolve<SessionContextType>(kInjectionKeys.session),
  dbConnection: () =>
    container.resolve<DbConnection>(kInjectionKeys.dbConnection),
  email: () => container.resolve<IEmailProviderContext>(kInjectionKeys.email),
  promises: () => container.resolve<PromiseStore>(kInjectionKeys.promises),
  locks: () => container.resolve<LockStore>(kInjectionKeys.locks),
  disposables: () =>
    container.resolve<DisposablesStore>(kInjectionKeys.disposables),
  logger: () => container.resolve<Logger>(kInjectionKeys.logger),
};
