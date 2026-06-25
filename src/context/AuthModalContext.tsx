import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthMode, AuthRole } from '../types/landing';
import { AuthModal } from '../components/AuthModal';

interface AuthModalState {
  open: boolean;
  mode: AuthMode;
  role: AuthRole;
}

interface AuthModalContextValue {
  openAuth: (mode: AuthMode, role?: AuthRole) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

/**
 * Provides the global auth modal. Any component can call
 * `useAuthModal().openAuth('login' | 'register', 'buyer' | 'seller')`.
 * Mirrors the original design's `open(mode, role)` handler.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthModalState>({ open: false, mode: 'login', role: 'buyer' });

  const openAuth = useCallback((mode: AuthMode, role: AuthRole = 'buyer') => {
    setState({ open: true, mode, role });
  }, []);
  const closeAuth = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      {state.open && (
        <AuthModal initialMode={state.mode} initialRole={state.role} onClose={closeAuth} />
      )}
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within <AuthModalProvider>');
  return ctx;
}
