import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '@/types';
import { cookies } from 'next/headers';

const DEFAULT_JWT_SECRET = '3b21c9cab1585948cfc439ac9384d302';
const DEFAULT_JWT_REFRESH_SECRET = '0a0c410da06e0aff1a01d9647505f44d';

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;

export const generateTokens = (payload: JwtPayload) => {
  // Access token expires in 7 days (configurable)
  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'] 
  });

  // Refresh token expires in 7 days (configurable)
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'] 
  });
  
  return { token, refreshToken };
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // 🔥 This automatically checks expiry (exp)
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null; // expired or invalid token
  }
};

export type AuthRole = 'superadmin' | 'cafeadmin';

export const tokenCookieName = (role: AuthRole) => {
  return role === 'superadmin' ? 'token_superadmin' : 'token_cafeadmin';
};

export const refreshTokenCookieName = (role: AuthRole) => {
  return role === 'superadmin' ? 'refreshToken_superadmin' : 'refreshToken_cafeadmin';
};

export const getTokenFromCookiesAny = () => {
  return cookies().get(tokenCookieName('cafeadmin'))?.value || cookies().get(tokenCookieName('superadmin'))?.value || null;
};

export const getRefreshTokenFromCookiesAny = () => {
  return cookies().get(refreshTokenCookieName('cafeadmin'))?.value || cookies().get(refreshTokenCookieName('superadmin'))?.value || null;
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

export const setTokenCookies = (token: string, refreshToken: string, role: AuthRole) => {
  const sevenDaysInSeconds = 60 * 60 * 24 * 7;

  try {
    // Clear legacy generic auth cookies from older sessions
    cookies().delete('token');
    cookies().delete('refreshToken');

    console.log('[JWT] setting cookies:', tokenCookieName(role), refreshTokenCookieName(role));

    cookies().set(tokenCookieName(role), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sevenDaysInSeconds,
      path: '/',
    });

    cookies().set(refreshTokenCookieName(role), refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sevenDaysInSeconds,
      path: '/',
    });
  } catch (cookieErr) {
    console.warn('[JWT] Could not set cookies via next/headers:', cookieErr);
  }
};

export const clearTokenCookies = (role?: AuthRole) => {
  try {
    if (role) {
      cookies().delete(tokenCookieName(role));
      cookies().delete(refreshTokenCookieName(role));
      cookies().delete('token');
      cookies().delete('refreshToken');
      return;
    }

    cookies().delete(tokenCookieName('superadmin'));
    cookies().delete(refreshTokenCookieName('superadmin'));
    cookies().delete(tokenCookieName('cafeadmin'));
    cookies().delete(refreshTokenCookieName('cafeadmin'));
    cookies().delete('token');
    cookies().delete('refreshToken');
  } catch (cookieErr) {
    console.warn('[JWT] Could not clear cookies via next/headers:', cookieErr);
  }
};

export const getTokenFromCookies = (role: AuthRole) => {
  const token = cookies().get(tokenCookieName(role))?.value;
  return token || null;
};