function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw Error(`${name} is not set`);
  }

  return value;
}

function parsePositiveIntEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const number = Number(value);

  if (number <= 0) {
    throw Error(`${name} number should be positive`);
  }

  if (!Number.isInteger(number)) {
    throw Error(`${name} number should be integer`);
  }

  return number;
}

export const config = {
  jwtSecret: requireEnv('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),
  port: parsePositiveIntEnv('PORT', 4000),
  host: '0.0.0.0',
  isProduction: process.env.NODE_ENV === 'production',
};
