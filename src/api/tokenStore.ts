// src/api/tokenStore.ts
import type { AuthResponse } from '../types/auth';

// --- The in-memory tokens (the ONLY copy outside React state). Plain module variables.
let accessToken: string | null = null;
let refreshToken: string | null = null;

// --- Callbacks the React layer (AuthProvider) registers, so the Axios interceptor can
//     push refreshed tokens back into React state, and trigger a logout when refresh fails.
let onTokensRefreshed: ((data: AuthResponse) => void) | null = null;
let onAuthFailure: (() => void) | null = null;

export const tokenStore = {
    // Read — used by the Axios request/response interceptors.
    getAccessToken: () => accessToken,
    getRefreshToken: () => refreshToken,

    // Write — AuthProvider mirrors its React state into here so the interceptors stay current.
    setTokens(access: string | null, refresh: string | null) {
        accessToken = access;
        refreshToken = refresh;
    },

    // AuthProvider registers how to react to events that originate inside the interceptor.
    registerCallbacks(cbs: {
        onTokensRefreshed: (data: AuthResponse) => void;
        onAuthFailure: () => void;
    }) {
        onTokensRefreshed = cbs.onTokensRefreshed;
        onAuthFailure = cbs.onAuthFailure;
    },

    // Called by the interceptor AFTER a successful refresh: update the store immediately
    // (so the very next request uses the new token) AND notify React state.
    handleRefreshed(data: AuthResponse) {
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        onTokensRefreshed?.(data);
    },

    // Called by the interceptor when refresh is impossible (no refresh token, or it failed).
    handleAuthFailure() {
        onAuthFailure?.();
    },
};