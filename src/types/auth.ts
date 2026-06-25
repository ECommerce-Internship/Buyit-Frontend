// src/types/auth.ts

// The "safe" view of a user the backend sends back (no password).
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null; // can be null — the backend allows no phone
    role: string;               // e.g. "Customer" or "Seller"
}

// Exactly what /auth/login and /auth/register return on success.
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds the access token stays valid
    user: User;
}