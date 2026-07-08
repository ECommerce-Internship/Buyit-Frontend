// src/types/auth.ts

// The three roles the backend issues (UserRole enum -> string). A union type means
// TypeScript will reject any value that isn't exactly one of these.
export type Role = 'Admin' | 'Seller' | 'Customer';

// The "safe" view of a user the backend sends back inside AuthResponse (no password).
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null; // backend allows no phone
    role: string;               // raw string from the API; we narrow it to Role in AuthUser
}

// Exactly what /auth/login, /auth/register and /auth/refresh-token return on success.
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds the access token stays valid
    user: User;
}

// What the AuthContext exposes to the app: the API user PLUS storeIds (decoded from the JWT,
// because the backend only puts storeIds inside the token, not in the user object) and a role
// narrowed to the Role union.
export interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    role: Role;
    storeIds: number[]; // empty for customers/admins; the seller's owned store ids
}

// GET /api/v1/auth/me returns this (no password; includes role + createdAt).
export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    role: string;
    createdAt: string; // ISO date string
}

// PUT /api/v1/auth/me accepts exactly these (email is NOT editable).
export interface UpdateProfileBody {
    firstName: string;
    lastName: string;
    phoneNumber: string | null; // send null to clear it
}

// POST /api/v1/auth/change-password accepts ONLY these two.
// (confirmPassword is a browser-only check — see Gap #1 — never sent.)
export interface ChangePasswordBody {
    currentPassword: string;
    newPassword: string;
}