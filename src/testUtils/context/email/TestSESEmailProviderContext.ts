import {SESEmailProviderContext} from '../../../contexts/email/SESEmailProviderContext';
import {AWSConfig} from '../../../utils/aws';
import {mockWith} from '../../helpers/mock';
import {ITestEmailProviderContext} from '../types';

export default class TestSESEmailProviderContext
  implements ITestEmailProviderContext
{
  private client: SESEmailProviderContext;

  sendEmail: ITestEmailProviderContext['sendEmail'];
  dispose: ITestEmailProviderContext['dispose'];

  constructor(params: AWSConfig) {
    this.client = new SESEmailProviderContext(params);
    this.sendEmail = jest.fn(this.client.sendEmail).mockName('sendEmail');
    this.dispose = jest.fn(this.client.dispose).mockName('close');

    mockWith(this.client, this);
  }
}
