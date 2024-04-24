import {NotFoundError} from './endpointErrors';
import {kAppMessages} from './messages';
import {InvalidCredentialsError} from './sessionErrors';

export const kReuseableErrors = {
  credentials: {
    invalidCredentials() {
      return new InvalidCredentialsError();
    },
  },
  common: {
    notImplemented() {
      return new Error(kAppMessages.common.notImplementedYet());
    },
    notFound(id?: string) {
      return new NotFoundError(kAppMessages.common.notFound(id));
    },
    invalidState(state?: string) {
      return new Error(kAppMessages.common.invalidState(state));
    },
  },
};
