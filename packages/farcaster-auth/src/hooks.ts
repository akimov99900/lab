'use client';

import { useEffect, useState } from 'react';
import { FarcasterUser } from './types';
import { initializeFarcasterClient } from './client';

export interface UseFarcasterUserResult {
  loading: boolean;
  error: Error | null;
  user: FarcasterUser | null;
  fid: number | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export function useFarcasterUser(): UseFarcasterUserResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const state = await initializeFarcasterClient();

        if (!isMounted) return;

        if (state.error) {
          setError(state.error);
          setUser(null);
        } else {
          setError(null);
          setUser(state.user);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    loading,
    error,
    user,
    fid: user?.fid ?? null,
    username: user?.username ?? null,
    displayName: user?.displayName ?? null,
    avatarUrl: user?.pfpUrl ?? null,
  };
}
