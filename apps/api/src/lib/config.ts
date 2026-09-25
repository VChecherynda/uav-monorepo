function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw Error(`${name} is not set`);
  }

  return value;
}

export const config = {
  jwtSecret: requireEnv('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),
  port: Number(process.env.PORT ?? 4000),
  host: '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production',
};
