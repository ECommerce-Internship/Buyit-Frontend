// src/components/products/SkeletonCard.tsx
export function SkeletonCard() {
    const pulse = { animation: 'bpulse 1.4s ease-in-out infinite' } as const;
    return (
        <div style={{ width: '100%', background: '#fff', border: '1px solid #eceaf2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(21,19,31,.04)' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', background: '#e9e7ef', borderBottom: '1px solid #eceaf2', ...pulse }} />
            <div style={{ padding: '15px 16px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ height: 14, width: '90%', borderRadius: 6, background: '#e9e7ef', ...pulse }} />
                <div style={{ height: 14, width: '62%', borderRadius: 6, background: '#edebf2', animation: 'bpulse 1.4s ease-in-out infinite', animationDelay: '.15s' }} />
                <div style={{ height: 11, width: '44%', borderRadius: 6, background: '#edebf2', animation: 'bpulse 1.4s ease-in-out infinite', animationDelay: '.3s', marginTop: 2 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ height: 20, width: '34%', borderRadius: 6, background: '#e9e7ef', ...pulse }} />
                    <div style={{ height: 22, width: '30%', borderRadius: 999, background: '#edebf2', animation: 'bpulse 1.4s ease-in-out infinite', animationDelay: '.2s' }} />
                </div>
            </div>
        </div>
    );
}