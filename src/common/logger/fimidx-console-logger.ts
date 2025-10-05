import {FimidxConsoleLikeLogger} from 'fimidx';
import {getClientConfig} from '../getClientConfig.js';
import {fimidxLogger} from './fimidx-logger.js';

const {nodeEnv, fimidxLoggerEnabled} = getClientConfig();

export const fimidxConsoleLogger = new FimidxConsoleLikeLogger({
  fimidxLogger: fimidxLogger,
  // Enable console fallback in development
  enableConsoleFallback: nodeEnv === 'development',
  enabled: fimidxLoggerEnabled,
});
