const isProd = process.env.NODE_ENV === 'production';

const defaultJwtSecret = 'change-me-in-production';
const defaultRefreshSecret = 'change-me-refresh-in-production';

const jwtSecret = process.env.JWT_SECRET ?? defaultJwtSecret;
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? defaultRefreshSecret;

if (isProd) {
  if (!process.env.JWT_SECRET || jwtSecret === defaultJwtSecret) {
    throw new Error('FATAL: JWT_SECRET must be set to a secure secret in production');
  }
  if (!process.env.JWT_REFRESH_SECRET || refreshSecret === defaultRefreshSecret) {
    throw new Error('FATAL: JWT_REFRESH_SECRET must be set to a secure secret in production');
  }
}

export const env = {
  isProd,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshSecret,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  port: parseInt(process.env.PORT || '4000', 10),
};
