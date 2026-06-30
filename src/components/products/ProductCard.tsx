// src/components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import type { ProductResponse } from '../../types/product';
import { formatCurrency } from '../../lib/format';
import { StockBadge } from './StockBadge';
import { StarRating } from './StarRating';

export function ProductCard({ product }: { product: ProductResponse }) {
    return (
        <div className="bcard" style={{ position: 'relative', width: '100%', background: '#fff', border: '1px solid #eceaf2', borderRadius: 16, overflow: 'hidden', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(21,19,31,.04)' }}>
            {/* image — links to the product detail page (TB-59) */}
            <Link to={`/products/${product.id}`} aria-label={product.name} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '1/1', background: 'radial-gradient(circle at 50% 30%, #fbfaff, #efebf8)', borderBottom: '1px solid #eceaf2', overflow: 'hidden' }}>
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#cbc8d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="7" y="9" width="34" height="30" rx="4" /><circle cx="16.5" cy="19" r="3.4" /><path d="M9 33 L19 24 L29 32 L35 27 L41 31" />
                        </svg>
                    </div>
                )}
            </Link>
            {/* body */}
            <div style={{ padding: '15px 16px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <Link to={`/products/${product.id}`} style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 15.5, lineHeight: 1.3, color: '#15131f', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>
                    {product.name}
                </Link>
                <Link to={`/stores/${product.storeSlug}`} style={{ fontSize: 13, fontWeight: 500, color: '#8d6cff', textDecoration: 'none', width: 'fit-content' }}>
                    Sold by {product.storeName}
                </Link>
                <div style={{ marginTop: 1 }}>
                    <StarRating rating={product.averageRating} count={product.reviewCount} scale={0.82} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 5 }}>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em', color: '#15131f' }}>{formatCurrency(product.price)}</span>
                    <StockBadge quantity={product.quantityInStock} />
                </div>
            </div>
        </div>
    );
}