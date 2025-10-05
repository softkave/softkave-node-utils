import {createHash} from 'crypto';
import jwt from 'jsonwebtoken';
import {v7 as uuidv7} from 'uuid';
import type {JWTTokenContent} from './types.js';

export const kDefaultExpiresAtDurationMs = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function encodeJWTToken(params: {
  id: string;
  refresh?: boolean;
  expiresAt?: Date;
  durationMs?: number;
  otherContent?: Record<string, string>;
  getJWTSecret: () => string;
}) {
  const {
    id,
    refresh,
    expiresAt: inputExpiresAt,
    durationMs,
    otherContent,
    getJWTSecret,
  } = params;

  const refreshToken = refresh
    ? createHash('sha256').update(uuidv7()).digest('hex')
    : undefined;
  const expiresAt = inputExpiresAt
    ? new Date(inputExpiresAt)
    : refreshToken
      ? new Date(Date.now() + (durationMs ?? kDefaultExpiresAtDurationMs))
      : undefined;
  const duration = expiresAt ? expiresAt.getTime() - Date.now() : undefined;
  const content: JWTTokenContent = {
    id,
    refreshToken,
    duration,
    ...otherContent,
  };
  const token = jwt.sign(
    content,
    getJWTSecret(),
    duration ? {expiresIn: `${duration}ms`} : undefined
  );

  return {token, refreshToken};
}
