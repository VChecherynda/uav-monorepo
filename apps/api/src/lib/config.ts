function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw Error(`${name} is not set`);
  }

  return value;
}

export const config = {
  jwtSecret: requireEnv('JWT_SECRET'),
};
