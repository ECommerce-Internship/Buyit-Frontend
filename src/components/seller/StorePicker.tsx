// src/components/seller/StorePicker.tsx
import type { CSSProperties } from 'react';
import type { Store, StoreStatus } from '../../types/store';

const STATUS_COLORS: Record<StoreStatus, { bg: string; fg: string }> = {
    Pending: { bg: 'rgba(255,178,77,0.14)', fg: '#ffb24d' },
    Approved: { bg: 'rgba(110,231,160,0.14)', fg: '#6ee7a0' },
    Suspended: { bg: 'rgba(255,93,122,0.14)', fg: '#ff5d7a' },
    Rejected: { bg: 'rgba(255,93,122,0.14)', fg: '#ff5d7a' },
};

interface Props {
    stores: Store[];
    selectedId: number | null;
    onChange: (id: number) => void;
}

// A dropdown letting a seller who owns more than one store choose which one they're managing.
// With only one store, it renders as a plain label + badge instead of a single-option dropdown.
export function StorePicker({ stores, selectedId, onChange }: Props) {
    if (stores.length === 0) return null;

    if (stores.length === 1) {
        const s = stores[0];
        const c = STATUS_COLORS[s.status];
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: c.fg, background: c.bg }}>
                    {s.status}
                </span>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Managing store
            </label>
            <select value={selectedId ?? ''} onChange={(e) => onChange(Number(e.target.value))} style={selectStyle}>
                {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                ))}
            </select>
        </div>
    );
}

const selectStyle: CSSProperties = {
    boxSizing: 'border-box', padding: '10px 12px', fontSize: 14.5, fontFamily: 'inherit', color: '#fff',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 11,
    outline: 'none', minWidth: 240,
};