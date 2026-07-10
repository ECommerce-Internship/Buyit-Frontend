// src/pages/GoogleCallbackPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { LOGIN_PATH } from '../lib/authRoutes';
import type { AuthResponse } from '../types/auth';

// Decode a Base64URL string (URL-safe base64) back into normal UTF-8 text.
// This mirrors the proven decoding already used in src/lib/jwt.ts for JWT payloads.
function base64UrlToJson(value: string): string {
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    // Re-add the '=' padding that Base64URL strips, so atob() never rejects the input.
    while (base64.length % 4 !== 0) base64 += '=';
    return decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join(''),
    );
}

export function GoogleCallbackPage() {
    const navigate = useNavigate();
    const { login } = useAuth();            // reuse the SAME login as email/password
    const hasRun = useRef(false);           // guard: run the effect body only once
    const [message] = useState('Signing you in…');

    useEffect(() => {
        if (hasRun.current) return;         // StrictMode runs effects twice in dev — block the 2nd
        hasRun.current = true;

        // window.location.hash looks like "#data=XXedYY" or "#error=Something%20failed".
        // Strip the leading '#' and parse it just like a query string.
        const hash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;
        const params = new URLSearchParams(hash);

        const error = params.get('error');
        const data = params.get('data');

        // Immediately remove the sensitive fragment from the address bar / history.
        window.history.replaceState(null, '', window.location.pathname);

        if (error) {
            // URLSearchParams already percent-decoded this value — do NOT decode it again.
            toast.error(error || 'Google sign-in failed.');
            navigate(LOGIN_PATH, { replace: true });
            return;
        }

        if (!data) {
            toast.error('Google sign-in returned no data.');
            navigate(LOGIN_PATH, { replace: true });
            return;
        }

        // Decode the payload first. A failure HERE means the data itself was unreadable.
        let authResponse: AuthResponse;
        try {
            authResponse = JSON.parse(base64UrlToJson(data)) as AuthResponse;
        } catch {
            toast.error('Could not read the Google sign-in result.');
            navigate(LOGIN_PATH, { replace: true });
            return;
        }

        // Unlike email/password login, the Google callback runs on the BACKEND origin, so it can't
        // set a refresh cookie THIS app's domain can read on a later reload — the token instead
        // arrives here in the URL fragment. Trade it for a first-party HttpOnly cookie by calling
        // the backend over our OWN origin (the same-origin "/api" proxy): that response sets the
        // cookie on the app's domain, so the session now survives a page refresh. The backend
        // ROTATES the token, so the copy that was in the fragment is revoked the instant it's used.
        // _skipAuthRefresh keeps a 401 here from triggering the interceptor's refresh/logout loop.
        async function completeSignIn(oauth: AuthResponse) {
            try {
                const res = await axiosInstance.post<AuthResponse>(
                    '/api/v1/auth/oauth-exchange',
                    { refreshToken: oauth.refreshToken },
                    { _skipAuthRefresh: true },
                );
                // login() stores the fresh access token + user in memory and navigates by role.
                login(res.data);
            } catch {
                toast.error('Could not complete sign-in. Please try again.');
                navigate(LOGIN_PATH, { replace: true });
            }
        }

        completeSignIn(authResponse);
    }, [login, navigate]);

    // A minimal "please wait" screen while the effect above runs.
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#fff' }}>
            <p>{message}</p>
        </div>
    );
}
