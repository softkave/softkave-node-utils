import {ValueOf} from 'type-fest';

export const kCurrentJWTTokenVersion = 1;

export const kTokenAccessScope = {
  Login: 'login',
  ChangePassword: 'changePassword',
  ConfirmEmailAddress: 'confirmEmail',
} as const;

export type TokenAccessScope = ValueOf<typeof kTokenAccessScope>;

export interface TokenSubjectDefault {
  id: string;
}

export interface BaseTokenData<
  Sub extends TokenSubjectDefault = TokenSubjectDefault,
> {
  version: number;
  sub: Sub;
  iat: number;
  exp?: number;
}
