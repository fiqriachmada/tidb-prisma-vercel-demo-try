/**
 * ClientProviders — wraps all client-side-only libraries that are
 * incompatible with React 19 SSR (Recoil, Notistack).
 *
 * This component is loaded with { ssr: false } so it is NEVER
 * executed on the server, preventing the ReactCurrentDispatcher crash.
 */
import { ReactNode, useEffect } from 'react';
import { RecoilRoot, useRecoilSnapshot } from 'recoil';
import { SnackbarProvider } from 'notistack';
import { useThemeInit } from 'hooks/useTheme';
import AuthModal from 'components/v2/Auth/AuthModal';

function DebugObserver() {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);
  return null;
}

function ThemeInit() {
  useThemeInit();
  return null;
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <RecoilRoot>
      <DebugObserver />
      <ThemeInit />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <AuthModal />
        {children}
      </SnackbarProvider>
    </RecoilRoot>
  );
}
