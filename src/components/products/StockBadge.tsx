import { stockLevel, type StockLevel } from '../../lib/format';

const STYLES: Record<StockLevel, { bg: string; fg: string; dot: string; glow: string; label: string }> = {
    in: { bg: '#e6f7ec', fg: '#177a3f', dot: '#22c55e', glow: 'rgba(34,197,94,.55)', label: 'In Stock' },
    low: { bg: '#fdf1dc', fg: '#a85f08', dot: '#f59e0b', glow: 'rgba(245,158,11,.55)', label: 'Low Stock' },
    out: { bg: '#fdecec', fg: '#c0392b', dot: '#ef4444', glow: 'rgba(239,68,68,.55)', label: 'Out of Stock' },
};

export function StockBadge({ quantity }: { quantity: number }) {
    const s = STYLES[stockLevel(quantity)];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: s.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 12, fontWeight: 600, lineHeight: 1, color: s.fg, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, boxShadow: s.glow === 'transparent' ? 'none' : `0 0 6px ${s.glow}` }} />
            {s.label}
        </span>
    );
}