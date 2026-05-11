'use client';

import { RoleProvider } from '@/context/RoleContext';

/**
 * Client-side wrapper that mounts all global providers.
 * Kept separate from layout.tsx so the root layout can remain a Server Component
 * (required for Next.js Metadata export to work).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
