// src/pages/admin/ImportResultModal.tsx
import type { CSSProperties } from 'react';
import type { ImportResult } from '../../types/product';

interface Props {
    result: ImportResult | null;  // null while nothing has been imported yet
    onClose: () => void;
}

export function ImportResultModal({ result, onClose }: Props) {
    if (!result) return null; // render nothing if we have no result

    return (
        <div onClick={onClose} style={overlay}>
            <div onClick={(e) => e.stopPropagation()} style={card}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
                    Import finished
                </h2>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Stat label="Added" value={result.addedCount} color="#8be0a4" />
                    <Stat label="Failed" value={result.failedCount} color="#ff8fa3" />
                </div>

                {result.errors.length > 0 && (
                    <details style={{ marginBottom: 16 }}>
                        <summary style={{ cursor: 'pointer', color: '#ffcd8a', fontWeight: 600 }}>
                            Show {result.errors.length} error(s)
                        </summary>
                        <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13.5, color: 'rgba(255,255,255,0.75)' }}>
                            {result.errors.map((e, i) => (
                                <li key={i} style={{ marginBottom: 6 }}>
                                    <strong>Row {e.row}:</strong> {e.reason}
                                </li>
                            ))}
                        </ul>
                    </details>
                )}

                <button onClick={onClose}
                    style={{
                        padding: '10px 16px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, color: '#fff',
                        border: 'none', borderRadius: 12, cursor: 'pointer',
                        background: 'linear-gradient(120deg,#8b5cf6,#6366f1)',
                    }}>
                    Done
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
        </div>
    );
}

const overlay: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000,
};
const card: CSSProperties = {
    width: '100%', maxWidth: 460, background: '#14141f', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24,
};
