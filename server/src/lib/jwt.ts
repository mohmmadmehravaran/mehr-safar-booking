import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export type Role = 'user' | 'admin';

export interface TokenPayload {
  sub: number; // user/admin id
  role: Role;
  name: string;
}

export const signToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
