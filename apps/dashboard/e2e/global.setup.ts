import { execSync } from 'node:child_process';

export default function () {
  execSync('npx prisma db seed', { cwd: '../api', stdio: 'inherit' });
}
