import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: AuthUser): string => {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(
    {
      // Use 'id' as the canonical field so the auth middleware can read it directly
      id: user.id,
      userId: user.id, // kept for backward compatibility
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    config.jwt.secret,
    options
  );
};

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): AuthUser => {
  return jwt.verify(token, config.jwt.secret) as AuthUser;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const generateVerificationToken = (): string => {
  const options: SignOptions = { expiresIn: '24h' };
  return jwt.sign({ purpose: 'email-verification' }, config.jwt.secret, options);
};

export const generateResetToken = (): string => {
  const options: SignOptions = { expiresIn: '1h' };
  return jwt.sign({ purpose: 'password-reset' }, config.jwt.secret, options);
};
