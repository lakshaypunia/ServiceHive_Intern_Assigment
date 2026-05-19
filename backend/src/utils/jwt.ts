import jwt from 'jsonwebtoken';

export interface JwtPayload {
  _id: string;
  email: string;
  role: string;
}

const getSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
};

export const signToken = (payload: JwtPayload): string => {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload;
};
