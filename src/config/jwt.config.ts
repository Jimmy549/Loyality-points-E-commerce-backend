import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production-with-256-bit-key',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as `${number}d`,
  },
});

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-with-256-bit-key';