
interface PaginationProps {
    page: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}

// PLAIN functional version. Restyle later; keep the props.
export function Pagination({ page, totalPages, hasPrevious, hasNext, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null; // nothing to page through

    // [1, 2, 3, ... totalPages]
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const btn = (active: boolean): React.CSSProperties => ({
        minWidth: 36, height: 36, borderRadius: 8, cursor: 'pointer',
        border: '1px solid #eceaf2',
        background: active ? '#7c5cff' : '#fff',
        color: active ? '#fff' : '#15131f', fontWeight: 600,
    });

    return (
        <nav style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
            <button style={btn(false)} disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>
                Previous
            </button>
            {pages.map((n) => (
                <button key={n} style={btn(n === page)} onClick={() => onPageChange(n)}>
                    {n}
                </button>
            ))}
            <button style={btn(false)} disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
                Next
            </button>
        </nav>
    );
}