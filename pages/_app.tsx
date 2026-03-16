import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot, useRecoilSnapshot } from 'recoil';
import { useEffect } from 'react';
import { SnackbarProvider } from 'notistack';

import AuthModal from 'components/v2/Auth/AuthModal';
import { useThemeInit } from 'hooks/useTheme';

// ─── Global Query Client ──────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

// ─── Recoil Debug Observer (dev only) ───────────────────────────────────────
function DebugObserver(): any {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);
  return null;
}

// ─── App Shell (needs to be inside SessionProvider to call hooks) ────────────
function AppShell({ Component, pageProps }: AppProps) {
  // Sync persisted theme to <html data-theme="..."> on mount
  useThemeInit();

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      {/* Global auth modal — rendered once, controlled by Zustand */}
      <AuthModal />
      <Component {...pageProps} />
    </SnackbarProvider>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function MyApp(props: AppProps) {
  const { pageProps } = props;

  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <DebugObserver />
          <AppShell {...props} />
        </RecoilRoot>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
