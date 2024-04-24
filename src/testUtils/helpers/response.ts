import {BaseEndpointResult} from '../../endpoints';

export function assertEndpointResultOk(result?: BaseEndpointResult | void) {
  if (result?.errors?.length) {
    throw result.errors;
  }

  return true;
}
