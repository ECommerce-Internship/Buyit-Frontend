// src/api/axiosInstance.ts
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';
import type { AuthResponse } from '../types/auth';

// Allow our two private flags on the request config (TypeScript module augmentation).
// We must augment BOTH interfaces: AxiosRequestConfig is the type of the config you pass to
// axiosInstance.post(url, body, CONFIG); InternalAxiosRequestConfig is what the interceptors
// receive (error.config). Augmenting only the Internal one causes TS2353 at the logout() call.
declare module 'axios' {
    export interface AxiosRequestConfig {
        _retry?: boolean;
        _skipAuthRefresh?: boolean;
    }
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;          // "we've already tried to refresh for this request"
        _skipAuthRefresh?: boolean; // "never attempt a refresh for this request" (e.g. logout)
    }
}

// When VITE_API_URL is blank the client talks to its OWN origin (relative "/api/..." URLs).
// In production the Vercel rewrite in vercel.json proxies "/api/*" to the backend, which makes
// the refresh-token cookie FIRST-PARTY (same site as the app) so it survives a page reload.
// Cross-site (third-party) cookies are blocked by Safari/Chrome, which was the "logged out on
// refresh" bug. Locally VITE_API_URL is set to http://localhost:5000, so behaviour is unchanged.
const API_URL = import.meta.env.VITE_API_URL ?? '';

// One configured Axios client the whole app shares.
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // send/receive the HttpOnly refreshToken cookie
});

// REQUEST INTERCEPTOR: attach the in-memory access token (read from the bridge), if any.
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStore.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // you MUST return config, or the request never goes out
    },
    (error) => Promise.reject(error),
);

// --- Single-flight refresh: many parallel 401s share ONE refresh call.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
    try {
        // Bare axios (NOT axiosInstance) so this call skips the interceptors above.
        // No body needed: the refresh token travels as the HttpOnly cookie, sent
        // automatically because withCredentials is set.
        const res = await axios.post<AuthResponse>(
            `${API_URL}/api/v1/auth/refresh-token`,
            {},
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
        );

        // Update the store + push into React state (keeps both worlds in sync).
        tokenStore.handleRefreshed(res.data);
        return res.data.accessToken;
    } catch (err) {
        // Refresh failed (no/expired/revoked refresh token cookie, network, etc.) => log out.
        // This lives INSIDE the single-flight call, so it runs ONCE even when many parallel
        // 401s are awaiting the same refresh — not once per queued request.
        tokenStore.handleAuthFailure();
        throw err;
    }
}

// RESPONSE INTERCEPTOR: on 401, try to refresh-and-retry exactly once.
axiosInstance.interceptors.response.use(
    (response) => response, // success: pass straight through
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig | undefined;
        const status = error.response?.status;

        // Only recover from a genuine 401, only once, and never for opted-out requests.
        if (status !== 401 || !original || original._retry || original._skipAuthRefresh) {
            return Promise.reject(error);
        }

        original._retry = true;
        try {
            // Reuse an in-flight refresh if one is already happening.
            refreshPromise = refreshPromise ?? refreshAccessToken();
            const newAccessToken = await refreshPromise;

            // Retry the original request with the fresh token.
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(original);
        } catch (refreshError) {
            // The logout side effect already fired once inside refreshAccessToken(); here we
            // just propagate the rejection so the original caller's catch still runs.
            return Promise.reject(refreshError);
        } finally {
            refreshPromise = null; // allow a future refresh
        }
    },
);

export default axiosInstance;