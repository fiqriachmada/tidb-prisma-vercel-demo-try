import { useAuthModalStore } from 'store';
import { useCurrentUser } from './useCurrentUser';

/**
 * Guards an action behind authentication.
 *
 * Usage:
 * ```tsx
 * const { requireAuth } = useAuthGuard();
 * <button onClick={() => requireAuth(handleCheckout)}>Checkout</button>
 * ```
 */
export function useAuthGuard() {
  const { isAuthenticated } = useCurrentUser();
  const openModal = useAuthModalStore((s) => s.openModal);

  /**
   * Runs `action` if the user is authenticated, otherwise shows the login modal.
   * @param action  The callback to run after authentication is confirmed.
   * @param intent  Optional string passed to the modal (e.g. 'checkout').
   */
  function requireAuth(action: () => void, intent?: string) {
    if (isAuthenticated) {
      action();
    } else {
      openModal('login', intent);
    }
  }

  return { requireAuth, isAuthenticated };
}
