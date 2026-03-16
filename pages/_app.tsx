import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dynamic from 'next/dynamic';

// ─── Global Query Client ──────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

// ─── Client-only providers (Recoil + Notistack incompatible with React 19 SSR) ──
// Loading with ssr:false prevents "ReactCurrentDispatcher is undefined" crash.
const ClientProviders = dynamic(
  () => import('components/v2/Providers/ClientProviders'),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <QueryClientProvider client={queryClient}>
        <ClientProviders>
          <Component {...pageProps} />
        </ClientProviders>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
