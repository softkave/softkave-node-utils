import {millisecondsToSeconds, toDate} from 'date-fns';
import * as jwt from 'jsonwebtoken';
import {identity} from 'lodash';
import {cast, convertToArray, indexArray} from 'softkave-js-utils';
import {
  BaseTokenData,
  TokenAccessScope,
  TokenSubjectDefault,
  kCurrentJWTTokenVersion,
} from '../definitions/token';
import {appAssert} from '../utils/assertion';
import {kUtilsInjectables} from './injection/injectables';
import {CredentialsExpiredError} from '../errors/sessionErrors';

export interface SessionContextType {
  decodeToken: (token: string) => BaseTokenData<TokenSubjectDefault>;
  tokenContainsScope: (
    tokenData: {scope: string[]},
    expectedTokenScopes: TokenAccessScope | TokenAccessScope[]
  ) => boolean;
  encodeToken: (
    tokenId: string,
    expires?: string | Date | number | null,
    issuedAt?: string | Date | number | null
  ) => string;
}

export default class SessionContext implements SessionContextType {
  decodeToken = (token: string) => {
    const suppliedConfig = kUtilsInjectables.suppliedConfig();
    appAssert(suppliedConfig.jwtSecret);

    const tokenData = cast<BaseTokenData<TokenSubjectDefault>>(
      jwt.verify(token, suppliedConfig.jwtSecret, {complete: false})
    );

    if (tokenData.version < kCurrentJWTTokenVersion) {
      throw new CredentialsExpiredError();
    }

    return tokenData;
  };

  tokenContainsScope = (
    tokenData: {scope: string[]},
    expectedTokenScopes: TokenAccessScope | TokenAccessScope[]
  ) => {
    const tokenScopes = tokenData.scope ?? [];
    const expectedTokenScopesMap = indexArray(
      convertToArray(expectedTokenScopes),
      {reducer: () => true, indexer: identity}
    );
    const hasTokenAccessScope = !!tokenScopes.find(
      nextScope => expectedTokenScopesMap[nextScope]
    );
    return hasTokenAccessScope;
  };

  encodeToken = (
    tokenId: string,
    expires?: string | Date | number | null,
    issuedAt?: string | Date | number | null
  ) => {
    const suppliedConfig = kUtilsInjectables.suppliedConfig();
    appAssert(suppliedConfig.jwtSecret);

    const payload: Omit<BaseTokenData, 'iat'> & {iat?: number} = {
      version: kCurrentJWTTokenVersion,
      sub: {id: tokenId},
    };

    if (expires) {
      payload.exp = millisecondsToSeconds(toDate(expires).valueOf());
    }

    if (issuedAt) {
      payload.iat = millisecondsToSeconds(toDate(issuedAt).valueOf());
    }

    return jwt.sign(payload, suppliedConfig.jwtSecret);
  };
}
