// src/api/tokenStore.ts
import type { AuthResponse } from '../types/auth';

// --- The in-memory access token (the ONLY copy outside React state). Plain module variable.
// The refresh token is NOT tracked here anymore — it lives only in an HttpOnly cookie the
// browser manages, so JavaScript (and any XSS payload) can never read or exfiltrate it.
let accessToken: string | null = null;

// --- Callbacks the React layer (AuthProvider) registers, so the Axios interceptor can
//     push refreshed tokens back into React state, and trigger a logout when refresh fails.
let onTokensRefreshed: ((data: AuthResponse) => void) | null = null;
let onAuthFailure: (() => void) | null = null;

export const tokenStore = {
    // Read — used by the Axios request interceptor.
    getAccessToken: () => accessToken,

    // Write — AuthProvider mirrors its React state into here so the interceptor stays current.
    setAccessToken(token: string | null) {
        accessToken = token;
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
        onTokensRefreshed?.(data);
    },

    // Called by the interceptor when refresh is impossible (no refresh token cookie, or it failed).
    handleAuthFailure() {
        onAuthFailure?.();
    },
};
