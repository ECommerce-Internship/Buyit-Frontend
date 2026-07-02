// src/context/AuthContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { tokenStore } from '../api/tokenStore';
import { storeIdsFromToken } from '../lib/jwt';
import { redirectPathForRole, toRole, LOGIN_PATH } from '../lib/authRoutes';
import type { AuthResponse, AuthUser } from '../types/auth';



// The shape of everything the context hands to the rest of the app.
interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (data: AuthResponse) => void;
    logout: () => Promise<void>;
    updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Build the rich AuthUser from an API response: copy the user fields, narrow the role,
// and decode storeIds out of the access token (the only place the backend puts them).
function toAuthUser(data: AuthResponse): AuthUser {
    return {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNumber: data.user.phoneNumber,
        role: toRole(data.user.role),
        storeIds: storeIdsFromToken(data.accessToken),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // The access token + user live in MEMORY only. The refresh token lives in an HttpOnly
    // cookie (set by the backend), which is what lets restoreSession() below rebuild the
    // session after a page reload without ever exposing the refresh token to JavaScript.
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Clear everything locally (used by logout and by refresh-failure). Also drop all
    // cached server state so one user's data (e.g. the ['me'] profile) can't bleed into
    // the next session in the same SPA. (Review finding #3 — CWE-525.)
    const clearSession = useCallback(() => {
        setAccessToken(null);
        setUser(null);
        tokenStore.setAccessToken(null);
        queryClient.clear();
    }, [queryClient]);

    // Called after a successful login/register (AuthModal already calls this with res.data).
    const login = useCallback(
        (data: AuthResponse) => {
            const authUser = toAuthUser(data);
            setAccessToken(data.accessToken);
            setUser(authUser);
            tokenStore.setAccessToken(data.accessToken); // sync the bridge now
            navigate(redirectPathForRole(authUser.role));              // role-based redirect
        },
        [navigate],
    );

    // Patch a few fields of the logged-in user (e.g. after a profile save) without re-login.
    const updateUser = useCallback((partial: Partial<AuthUser>) => {
        setUser((prev) => (prev ? { ...prev, ...partial } : prev));
    }, []);

    // Revoke the refresh token cookie on the server, then clear local state no matter what.
    const logout = useCallback(async () => {
        try {
            await axiosInstance.post(
                '/api/v1/auth/logout',
                {},
                { _skipAuthRefresh: true }, // a 401 here must not trigger a refresh
            );
        } catch {
            // Ignore network/4xx errors — logout must always succeed locally.
        } finally {
            clearSession();
            navigate(LOGIN_PATH);
        }
    }, [clearSession, navigate]);

    // Keep the non-React bridge in sync with React state (covers the refresh path too).
    useEffect(() => {
        tokenStore.setAccessToken(accessToken);
    }, [accessToken]);

    // Register the callbacks the Axios interceptor calls (refresh success / auth failure).
    useEffect(() => {
        tokenStore.registerCallbacks({
            onTokensRefreshed: (data) => {
                // A silent refresh happened: update state so the UI keeps the latest tokens.
                setAccessToken(data.accessToken);
                setUser(toAuthUser(data));
            },
            onAuthFailure: () => {
                // Refresh was impossible: log the user out and send them to the login screen.
                clearSession();
                navigate(LOGIN_PATH);
            },
        });
    }, [clearSession, navigate]);

    // On first mount, ask the server if we still have a valid session (via the HttpOnly
    // refresh-token cookie). This is what makes a page refresh NOT log the user out.
    useEffect(() => {
        let cancelled = false;

        async function restoreSession() {
            try {
                const res = await axiosInstance.post<AuthResponse>(
                    '/api/v1/auth/refresh-token',
                    {},
                    { _skipAuthRefresh: true },
                );
                if (!cancelled) {
                    setAccessToken(res.data.accessToken);
                    setUser(toAuthUser(res.data));
                    tokenStore.setAccessToken(res.data.accessToken);
                }
            } catch {
                // No valid cookie (never logged in, or it expired) — stay logged out. Not an error.
            } finally {
                if (!cancelled) setIsInitializing(false);
            }
        }

        restoreSession();
        return () => { cancelled = true; };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: accessToken !== null,
                isInitializing,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook so components can do: const { user, login, logout } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
