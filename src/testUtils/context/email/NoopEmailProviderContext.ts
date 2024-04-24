import {noopAsync} from 'softkave-js-utils';
import {IEmailProviderContext} from '../../../contexts/email/types';

export default class NoopEmailProviderContext implements IEmailProviderContext {
  sendEmail = noopAsync;
  dispose = noopAsync;
}
