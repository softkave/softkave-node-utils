import {ClientSession} from 'mongoose';
import {AnyFn} from 'softkave-js-utils';
import {
  isMongoClientSession,
  isMongoConnection,
} from '../../mongodb/connection';
import {appAssert} from '../../utils/assertion';
import {kAsyncLocalStorageKeys} from '../asyncLocalStorage';
import {kUtilsInjectables} from '../injection/injectables';
import {DataProviderUtils} from './types';

export class MongoDataProviderUtils implements DataProviderUtils {
  async withTxn<TResult>(
    fn: AnyFn<[txn: ClientSession], Promise<TResult>>,
    reuseAsyncLocalTxn = true,
    existingSession?: unknown
  ): Promise<TResult> {
    let result: TResult | undefined = undefined;

    if (!existingSession && reuseAsyncLocalTxn) {
      existingSession = kUtilsInjectables
        .asyncLocalStorage()
        .get<ClientSession>(kAsyncLocalStorageKeys.txn);
    }

    if (existingSession) {
      appAssert(isMongoClientSession(existingSession));
      result = await fn(existingSession);
    } else {
      const connection = kUtilsInjectables.dbConnection().get();
      appAssert(isMongoConnection(connection));
      const session = await connection.startSession();
      await session.withTransaction(async () =>
        kUtilsInjectables
          .asyncLocalStorage()
          .shadowSetForce(
            kAsyncLocalStorageKeys.txn,
            session,
            async () => (result = await fn(session))
          )
      );
      await session.endSession();
    }

    // `connection.transaction` throws if error occurs so if the control flow
    // gets here, `result` is set.
    return result as unknown as TResult;
  }
}
