import config from 'config';
import {LoggerType} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';
import {AWSConfig} from '../utils/aws';

export const kFimidaraConfigEmailProvider = {
  ses: 'ses',
  noop: 'noop',
} as const;

export type FimidaraConfigEmailProvider = ValueOf<
  typeof kFimidaraConfigEmailProvider
>;

export const kFimidaraConfigSecretsManagerProvider = {
  awsSecretsManager: 'awsSecretsManager',
  memory: 'memory',
} as const;

export type FimidaraConfigSecretsManagerProvider = ValueOf<
  typeof kFimidaraConfigSecretsManagerProvider
>;

export const kFimidaraConfigDbType = {
  mongoDb: 'mongoDb',
  noop: 'noop',
} as const;

export type FimidaraConfigDbType = ValueOf<typeof kFimidaraConfigDbType>;

export type FimidaraSuppliedConfig = Partial<{
  clientDomain: string;
  dbType: FimidaraConfigDbType;
  mongoDbURI: string;
  mongoDbDatabaseName: string;
  jwtSecret: string;
  exposeHttpServer: boolean;
  httpPort: string;
  exposeHttpsServer: boolean;
  httpsPort: string;
  httpsPublicKeyFilepath: string;
  httpsPrivateKeyFilepath: string;
  emailProvider: FimidaraConfigEmailProvider;
  secretsManagerProvider: FimidaraConfigSecretsManagerProvider;
  awsConfig: AWSConfig;
  appName: string;
  appDefaultEmailAddressFrom: string;
  awsEmailEncoding: string;
  dateFormat: string;
  clientLoginLink: string;
  clientSignupLink: string;
  changePasswordLink: string;
  verifyEmailLink: string;
  test: {
    awsConfig?: AWSConfig;
    bucket?: string;
  };
  loggerType: LoggerType;
}>;

export type FimidaraConfig = FimidaraSuppliedConfig;

export function getSuppliedConfig(): FimidaraSuppliedConfig {
  const envSuppliedConfig = config.util.toObject();
  return envSuppliedConfig;
}
