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
import axiosInstance from '../api/axiosInstance';
import { tokenStore } from '../api/tokenStore';
import { storeIdsFromToken } from '../lib/jwt';
import { redirectPathForRole, toRole, LOGIN_PATH } from '../lib/authRoutes';
import type { AuthResponse, AuthUser } from '../types/auth';

// The shape of everything the context hands to the rest of the app.
interface AuthContextType {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    login: (data: AuthResponse) => void;
    logout: () => Promise<void>;
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

    // The session — in MEMORY only. A page reload wipes this (the in-memory trade-off).
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Clear everything locally (used by logout and by refresh-failure).
    const clearSession = useCallback(() => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        tokenStore.setTokens(null, null);
    }, []);

    // Called after a successful login/register (AuthModal already calls this with res.data).
    const login = useCallback(
        (data: AuthResponse) => {
            const authUser = toAuthUser(data);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setUser(authUser);
            tokenStore.setTokens(data.accessToken, data.refreshToken); // sync the bridge now
            navigate(redirectPathForRole(authUser.role));              // role-based redirect
        },
        [navigate],
    );

    // Revoke the refresh token on the server, then clear local state no matter what.
    const logout = useCallback(async () => {
        const currentRefresh = tokenStore.getRefreshToken();
        try {
            if (currentRefresh) {
                await axiosInstance.post(
                    '/api/v1/auth/logout',
                    { refreshToken: currentRefresh },
                    { _skipAuthRefresh: true }, // a 401 here must not trigger a refresh
                );
            }
        } catch {
            // Ignore network/4xx errors — logout must always succeed locally.
        } finally {
            clearSession();
            navigate(LOGIN_PATH);
        }
    }, [clearSession, navigate]);

    // Keep the non-React bridge in sync with React state (covers the refresh path too).
    useEffect(() => {
        tokenStore.setTokens(accessToken, refreshToken);
    }, [accessToken, refreshToken]);

    // Register the callbacks the Axios interceptor calls (refresh success / auth failure).
    useEffect(() => {
        tokenStore.registerCallbacks({
            onTokensRefreshed: (data) => {
                // A silent refresh happened: update state so the UI keeps the latest tokens.
                setAccessToken(data.accessToken);
                setRefreshToken(data.refreshToken);
                setUser(toAuthUser(data));
            },
            onAuthFailure: () => {
                // Refresh was impossible: log the user out and send them to the login screen.
                clearSession();
                navigate(LOGIN_PATH);
            },
        });
    }, [clearSession, navigate]);

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                isAuthenticated: accessToken !== null,
                login,
                logout,
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