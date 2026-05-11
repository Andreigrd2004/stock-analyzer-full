'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'BROKER' | 'USER' | null;

interface RoleContextValue {
  role: UserRole;
  loading: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────

const RoleContext = createContext<RoleContextValue>({ role: null, loading: true });

// ── Provider ──────────────────────────────────────────────────────────────────

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole]       = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false); // guard against double-fetch in React StrictMode

  useEffect(() => {
    // Only fetch if the user has an access token (i.e. is authenticated)
    const hasToken = document.cookie.includes('accessToken=');
    if (!hasToken || fetched.current) {
      setLoading(false);
      return;
    }

    fetched.current = true;

    fetchApi<string>('/auth/get-role')
      .then((r) => {
        // Backend may return a bare string "BROKER" or a JSON object { role: "BROKER" }
        if (typeof r === 'string') {
          setRole(r.trim().toUpperCase() as UserRole);
        } else if (r && typeof r === 'object' && 'role' in (r as object)) {
          setRole(((r as Record<string, string>).role).toUpperCase() as UserRole);
        }
      })
      .catch(() => {
        // Non-authenticated or network error — leave role as null
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {children}
    </RoleContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
