import {isString} from 'lodash';
import {AnyFn} from 'softkave-js-utils';
import {kUtilsInjectables} from '../contexts/injection/injectables';
import {ServerError} from '../errors/commonErrors';
import OperationError from '../errors/OperationError';

export function appAssert(
  value: unknown,
  response: string | Error | AnyFn = new ServerError(),
  logMessage?: string
): asserts value {
  if (!value) {
    if (logMessage) {
      kUtilsInjectables.logger().error(logMessage);
    }

    if (isString(response)) {
      throw new OperationError(response);
    } else if (response instanceof Error) {
      throw response;
    } else if (response) {
      response();
    } else {
      throw new Error('Assertion failed');
    }
  }
}
