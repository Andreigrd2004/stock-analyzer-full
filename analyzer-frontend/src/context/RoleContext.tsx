'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/lib/apiClient';



export type UserRole = 'ADMIN' | 'BROKER' | 'USER' | null;

interface RoleContextValue {
  role: UserRole;
  loading: boolean;
}



const RoleContext = createContext<RoleContextValue>({ role: null, loading: true });



export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole]       = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {

    const hasToken = document.cookie.includes('accessToken=');
    if (!hasToken || fetched.current) {
      setLoading(false);
      return;
    }

    fetched.current = true;

    fetchApi<string>('/auth/get-role')
      .then((r) => {

        if (typeof r === 'string') {
          setRole(r.trim().toUpperCase() as UserRole);
        } else if (r && typeof r === 'object' && 'role' in (r as object)) {
          setRole(((r as Record<string, string>).role).toUpperCase() as UserRole);
        }
      })
      .catch(() => {

      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {children}
    </RoleContext.Provider>
  );
}



export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
