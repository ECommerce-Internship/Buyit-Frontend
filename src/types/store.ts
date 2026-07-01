// src/types/store.ts

// The states a store can be in. A "string literal union" means the value MUST be exactly
// one of these — the compiler rejects any other string (great for status badges).
// Mirrors the backend StoreStatus enum (Buyit.Domain/Enums/StoreStatus.cs), which also
// includes "Rejected" for applications an admin declined.
export type StoreStatus = 'Pending' | 'Approved' | 'Suspended' | 'Rejected';

// The safe public shape of a store, mirroring the backend's StoreResponse DTO exactly.
// (Verified against Buyit.Application/DTOs/StoreResponse.cs.)
export interface Store {
    id: number;
    name: string;
    slug: string;                 // URL-friendly name the backend generated, e.g. "nova-tech"
    description: string | null;   // optional; backend may send null
    status: StoreStatus;          // "Pending" right after creation
    createdAt: string;            // ISO date-time string from the backend
    ownerName: string | null;
}

// What we SEND to POST /api/v1/auth/register-seller (one-step seller sign-up + first store).
export interface RegisterSellerBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    storeName: string;
    storeDescription?: string;    // the "?" means optional — we omit it when empty
}

// What we SEND to POST /api/v1/Stores (an existing seller opens another store) and to
// POST /api/v1/auth/become-seller (a logged-in customer opens their first store).
export interface CreateStoreBody {
    storeName: string;
    storeDescription?: string;
}
