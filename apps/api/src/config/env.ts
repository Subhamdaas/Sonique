export const env = {
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-in-production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
};
