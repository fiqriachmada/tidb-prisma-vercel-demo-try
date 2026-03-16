/**
 * ClientProviders — wraps client-side-only libraries.
 * Loaded with { ssr: false } so it never runs on the server.
 * Recoil has been fully removed (React 19 incompatible).
 */
import { ReactNode } from 'react';
import { SnackbarProvider } from 'notistack';
import { useThemeInit } from 'hooks/useTheme';
import AuthModal from 'components/v2/Auth/AuthModal';

function ThemeInit() {
  useThemeInit();
  return null;
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <ThemeInit />
      <AuthModal />
      {children}
    </SnackbarProvider>
  );
}
