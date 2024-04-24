import {kEndpointConstants} from '../endpoints/constants';
import {ServerRecommendedActionsMap} from '../endpoints/types';
import OperationError, {
  OperationErrorParameters,
  getErrorMessageFromParams,
} from './OperationError';
import {kAppMessages} from './messages';

export class InvalidCredentialsError extends OperationError {
  name = 'InvalidCredentialsError';
  action = ServerRecommendedActionsMap.LoginAgain;
  statusCode = kEndpointConstants.httpStatusCode.unauthorized;
  constructor(props?: OperationErrorParameters | string) {
    super(props);
    this.message = getErrorMessageFromParams(
      props,
      kAppMessages.token.invalidCredentials
    );
  }
}

export class CredentialsExpiredError extends OperationError {
  name = 'CredentialsExpiredError';
  action = ServerRecommendedActionsMap.LoginAgain;
  statusCode = kEndpointConstants.httpStatusCode.unauthorized;
  constructor(props?: OperationErrorParameters | string) {
    super(props);
    this.message = getErrorMessageFromParams(props, 'Credentials expired');
  }
}

export class PermissionDeniedError extends OperationError {
  name = 'PermissionDeniedError';
  statusCode = kEndpointConstants.httpStatusCode.forbidden;

  constructor(props?: OperationErrorParameters | string) {
    super(props);
    this.message = getErrorMessageFromParams(props, 'Permission denied');
  }
}
