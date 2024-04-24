import {SendEmailCommand, SESv2Client} from '@aws-sdk/client-sesv2';
import {appAssert} from '../../utils/assertion';
import {kUtilsInjectables} from '../injection/injectables';
import {IEmailProviderContext, SendEmailParams} from './types';
import {AWSConfig} from '../../utils/aws';

export class SESEmailProviderContext implements IEmailProviderContext {
  protected ses: SESv2Client;

  constructor(params: AWSConfig) {
    this.ses = new SESv2Client({
      region: params.region,
      credentials: {
        accessKeyId: params.accessKeyId,
        secretAccessKey: params.secretAccessKey,
      },
    });
  }

  sendEmail = async (params: SendEmailParams) => {
    const suppliedConfig = kUtilsInjectables.suppliedConfig();
    appAssert(suppliedConfig.awsEmailEncoding);

    const command = new SendEmailCommand({
      Destination: {ToAddresses: params.destination},
      FromEmailAddress: params.source,
      Content: {
        Simple: {
          Subject: {
            Charset: suppliedConfig.awsEmailEncoding,
            Data: params.subject,
          },
          Body: {
            Html: {
              Charset: suppliedConfig.awsEmailEncoding,
              Data: params.body.html,
            },
            Text: {
              Charset: suppliedConfig.awsEmailEncoding,
              Data: params.body.text,
            },
          },
        },
      },
    });

    await this.ses.send(command);
  };

  dispose = async () => {
    await this.ses.destroy();
  };
}
