import { useSession } from 'next-auth/react';

/**
 * Returns the current session user and derived helpers.
 * Wraps `useSession` so callers never import next-auth directly.
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as 'USER' | 'ADMIN' | undefined;

  return {
    user: session?.user ?? null,
    userId: (session?.user as any)?.id as string | undefined,
    role,
    isAdmin: role === 'ADMIN',
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',
  };
}
