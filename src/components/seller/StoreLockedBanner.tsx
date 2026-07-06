// src/components/seller/StoreLockedBanner.tsx
import type { CSSProperties } from 'react';
import type { StoreStatus } from '../../types/store';

// TB-139: shown wherever a seller's selected store is not Approved.
export function StoreLockedBanner({ status }: { status: StoreStatus }) {
    const suspended = status === 'Suspended';
    const rejected = status === 'Rejected';
    return (
        <div style={card}>
            <strong style={{ color: '#ffcd8a' }}>
                {suspended
                    ? 'This store has been suspended by the platform admin.'
                    : rejected
                        ? 'This store application was rejected.'
                        : 'This store is pending approval by the platform admin.'}
            </strong>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                {suspended
                    ? 'Product, inventory, and image management are locked while the store is suspended.'
                    : rejected
                        ? 'Product, inventory, and image management are unavailable for a rejected store.'
                        : 'You can look around, but adding/editing products, managing inventory, and uploading images unlock once an admin approves this store.'}
            </p>
        </div>
    );
}

const card: CSSProperties = {
    padding: 20, borderRadius: 16,
    border: '1px solid rgba(255,178,77,0.3)', background: 'rgba(255,178,77,0.08)',
    marginBottom: 24,
};