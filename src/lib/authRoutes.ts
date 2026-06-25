// src/lib/authRoutes.ts
import type { Role } from '../types/auth';

// The app root. Where we send a user who is NOT logged in (this app has no dedicated /login
// page — login is a modal on the landing page "/"; the ticket says "/login", but for THIS app
// the correct destination is "/"), and where a role guard sends someone who IS logged in but
// is not allowed on a page. If a real /login page is ever added, change LOGIN_PATH only.
export const HOME_PATH = '/';
export const LOGIN_PATH = HOME_PATH;

// The legal role values at runtime — used to narrow an untrusted API string into a Role.
const ROLES: readonly Role[] = ['Admin', 'Seller', 'Customer'];

// Narrow a raw string from the API into a Role WITHOUT lying to the compiler (no `as`).
// An unknown/unexpected role falls back to the least-privileged role, 'Customer', so the
// app fails closed (guards treat it as non-admin / non-seller).
export function toRole(value: string): Role {
    return ROLES.includes(value as Role) ? (value as Role) : 'Customer';
}

// Each role's "home" after login (the marketplace-alignment requirement on the ticket).
const HOME_BY_ROLE: Record<Role, string> = {
    Admin: '/admin',
    Seller: '/seller',
    Customer: '/products',
};

// Compute the post-login landing path for a role. Falls back to the customer home
// if somehow an unknown role slips through.
export function redirectPathForRole(role: Role): string {
    return HOME_BY_ROLE[role] ?? '/products';
}