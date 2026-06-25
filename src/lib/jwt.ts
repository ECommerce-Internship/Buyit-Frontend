// src/lib/jwt.ts

// Decode the PAYLOAD (middle segment) of a JWT into an object. This does NOT verify the
// signature — never trust this for security. It's only used to read claims for UI routing.
// Returns null if the token is missing/malformed (so callers can fall back safely).
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
    try {
        const payload = token.split('.')[1];          // the middle segment
        if (!payload) return null;
        // base64url -> base64, then atob -> raw text, then handle UTF-8 safely.
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(''),
        );
        return JSON.parse(json) as T;
    } catch {
        return null; // malformed token -> behave as "no claims"
    }
}

// The backend embeds seller store ids as a single comma-separated "storeIds" claim,
// e.g. "3,7" (sellers only; absent for customers/admins). Turn it into number[].
export function storeIdsFromToken(token: string): number[] {
    const payload = decodeJwtPayload<{ storeIds?: string }>(token);
    if (!payload?.storeIds) return [];
    return payload.storeIds
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
}