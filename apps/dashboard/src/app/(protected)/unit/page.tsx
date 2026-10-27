'use client';

import { RequireCommander } from '@/contexts/auth';
import Link from 'next/link';

export default function Unit() {
  return (
    <RequireCommander>
      <h1>Unit</h1>
      <Link href="/">← Station</Link>
    </RequireCommander>
  );
}
