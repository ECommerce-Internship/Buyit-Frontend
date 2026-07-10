// src/pages/ProductDetailPage.tsx
import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Star, Check, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/products/PageHeader';
import { useProduct } from '../hooks/useProduct';
import { useProductReviews } from '../hooks/useProductReviews';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { addCartItem } from '../api/cart';
import { formatCurrency } from '../lib/format';
import { StockBadge } from '../components/products/StockBadge';
import { StarRating } from '../components/products/StarRating';
import type { ProductResponse, ReviewResponse } from '../types/product';
import { submitReview, updateReview, deleteReview } from '../api/reviews';
import { ReviewForm } from '../components/products/ReviewForm';
import { Skeleton } from '../components/ui/Skeleton';

export function ProductDetailPage() {
    // 1) Read the :id from the URL ("/products/42" -> id === "42"), convert to a number.
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);

    // 2) Fetch the product and its reviews (two independent queries).
    const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
    const { data: reviewsData, isLoading: reviewsLoading, isError: reviewsError } = useProductReviews(productId);

    // 3) Who is logged in (cart needs a Customer), and how to open the login modal.
    const { isAuthenticated, user } = useAuth();
    const { openAuth } = useAuthModal();
    // Review state: the cache controller (to refresh after changes) and an "editing my review" flag.
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);
    // Capture "now" ONCE (lazy initializer) so the 48h check below stays pure during render.
    const [now] = useState(() => Date.now());

    // React reuses this component instance when only the :id param changes (product A -> B),
    // so leaving edit mode on for product B would be wrong. Reset it the React-sanctioned way:
    // store the param we rendered for and clear edit mode during render when it changes.
    // (See react.dev "Adjusting state when a prop changes" — preferred over a setState effect.)
    const [renderedProductId, setRenderedProductId] = useState(productId);
    if (productId !== renderedProductId) {
        setRenderedProductId(productId);
        setEditing(false);
    }

    // 4) The Add-to-Cart mutation. `isPending` drives the button spinner.
    const addToCart = useMutation({
        mutationFn: () => addCartItem(productId, 1),
        onSuccess: () => {
            toast.success('Added to cart!');
            // The header's cart badge (useCartCount) reads this same ['cart'] query —
            // without this it only updates on the next window-focus refetch or reload.
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: () => toast.error('Could not add to cart. Please try again.'),
    });

    // Refresh BOTH the reviews list AND the product (the product object carries the
    // averageRating + reviewCount that must update after any review change).
    const refreshAfterReviewChange = () => {
        queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
    };

    // CREATE a review.
    const submit = useMutation({
        mutationFn: (vars: { rating: number; comment: string | null }) =>
            submitReview(productId, vars),
        onSuccess: () => {
            toast.success('Thanks for your review!');
            refreshAfterReviewChange();
        },
        onError: (err) => toast.error(reviewErrorMessage(err)),
    });

    // EDIT my review.
    const edit = useMutation({
        mutationFn: (vars: { reviewId: number; rating: number; comment: string | null }) =>
            updateReview(vars.reviewId, { rating: vars.rating, comment: vars.comment }),
        onSuccess: () => {
            toast.success('Your review was updated.');
            setEditing(false);
            refreshAfterReviewChange();
        },
        onError: (err) => toast.error(reviewErrorMessage(err)),
    });

    // DELETE my review.
    const remove = useMutation({
        mutationFn: (reviewId: number) => deleteReview(reviewId),
        onSuccess: () => {
            toast.success('Your review was deleted.');
            refreshAfterReviewChange();
        },
        onError: (err) => toast.error(reviewErrorMessage(err)),
    });
    // SEO: while this page is open, use the product's AI-generated seoTitle/metaDescription
    // for the page <title> and the meta description tag. Whatever was there before is restored
    // on cleanup, so navigating away never leaves another page with this product's SEO text.
    useEffect(() => {
        if (!product) return;
        const originalTitle = document.title;
        if (product.seoTitle) document.title = product.seoTitle;

        let metaTag = document.querySelector('meta[name="description"]');
        const hadMetaTag = metaTag !== null;
        const originalContent = metaTag?.getAttribute('content') ?? null;
        if (product.metaDescription) {
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('name', 'description');
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', product.metaDescription);
        }

        return () => {
            document.title = originalTitle;
            if (product.metaDescription) {
                if (hadMetaTag && originalContent !== null) {
                    metaTag?.setAttribute('content', originalContent);
                } else if (!hadMetaTag) {
                    metaTag?.remove();
                }
            }
        };
    }, [product]);

    function handleAddToCart() {
        // Logged out -> invite to log in instead of firing a request that returns 401.
        if (!isAuthenticated) {
            toast('Please log in to add items to your cart.');
            openAuth('login', 'buyer');
            return;
        }
        // Logged in but not a Customer -> the backend would 403; tell them clearly.
        if (user && user.role !== 'Customer') {
            toast.error('Only customer accounts can add items to a cart.');
            return;
        }
        addToCart.mutate();
    }

    // ----- top-level states -----

    if (isLoading) {
        return (
            <Shell>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <Skeleton className="aspect-square w-full rounded-[20px]" />
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-8 w-4/5" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-9 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="mt-2 h-12 w-40 rounded-xl" />
                    </div>
                </div>
            </Shell>
        );
    }

    // Distinguish a real "gone" product (404, or a malformed/non-numeric id) from a
    // transient failure (network/500). Only the transient case offers a retry.
    if (isError || !product) {
        const status = (error as { response?: { status?: number } } | null)?.response?.status;
        const notFound = status === 404 || !Number.isFinite(productId) || productId <= 0;
        return (
            <Shell>
                <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, color: '#15131f', margin: 0 }}>
                    {notFound ? 'Product not found' : 'Couldn’t load this product'}
                </h1>
                <p style={{ color: '#6b6878', marginTop: 8 }}>
                    {notFound ? 'This product may have been removed.' : 'Something went wrong. Please try again.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                    {!notFound && (
                        <button onClick={() => refetch()} style={retryBtnStyle}>Try again</button>
                    )}
                    <Link to="/products" style={backLinkStyle}>← Back to all products</Link>
                </div>
            </Shell>
        );
    }

    const outOfStock = product.quantityInStock <= 0;
    const reviews = reviewsData?.reviews.items ?? [];

    // Find the logged-in user's own review among the loaded reviews (see Gap #2).
    const myReview = user ? reviews.find((r) => r.userId === user.id) ?? null : null;
    // The backend only allows editing within 48 hours of submission. Mirror that here.
    const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
    const canEditMyReview = myReview
        ? now - new Date(myReview.createdAt).getTime() <= FORTY_EIGHT_HOURS_MS
        : false;
    // Everyone else's reviews (so we don't list the user's own review twice).
    const otherReviews = myReview ? reviews.filter((r) => r.reviewId !== myReview.reviewId) : reviews;
    // Only logged-in Customers can write/own reviews (the backend restricts POST to Customers).
    const canWrite = isAuthenticated && user?.role === 'Customer';
    // A proxy for "this product's content came from the AI generator" — today, only
    // "Use This Content" in the admin form ever populates these three fields.
    const hasAiContent = Boolean(
        (product.features && product.features.length > 0) || product.seoTitle || product.metaDescription
    );

    return (
        <Shell>
            {/* Breadcrumb + back link */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9a97a8', marginBottom: 18 }}>
                <Link to="/" style={crumbStyle}>Home</Link>
                <span>/</span>
                <Link to="/products" style={crumbStyle}>Products</Link>
                <span>/</span>
                <span style={{ color: '#56536a' }}>{product.name}</span>
            </nav>
            <Link to="/products" style={{ ...backLinkStyle, marginBottom: 22, display: 'inline-block' }}>
                ← Back to all products
            </Link>

            {/* Two-column layout: image left, info right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                {/* LEFT: image or placeholder */}
                <div style={imageWrapStyle}>
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" stroke="#cbc8d6"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="7" y="9" width="34" height="30" rx="4" />
                                <circle cx="16.5" cy="19" r="3.4" />
                                <path d="M9 33 L19 24 L29 32 L35 27 L41 31" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* RIGHT: product info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* H1 = product.name (Gap #1: there is no seoTitle to prefer) */}
                    <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: '#15131f', margin: 0, lineHeight: 1.2 }}>
                        {product.name}
                    </h1>

                    {/* "Sold by {store}" -> storefront page */}
                    <Link to={`/stores/${product.storeSlug}`} style={{ fontSize: 14, fontWeight: 600, color: '#8d6cff', textDecoration: 'none', width: 'fit-content' }}>
                        Sold by {product.storeName}
                    </Link>

                    {/* Aggregate rating (reuses the listing's StarRating) */}
                    <StarRating rating={product.averageRating} count={product.reviewCount} />

                    {/* Price + stock badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 30, color: '#15131f' }}>
                            {formatCurrency(product.price)}
                        </span>
                        <StockBadge quantity={product.quantityInStock} />
                    </div>

                    {/* Description (falls back to a placeholder if there's nothing to show yet) */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h2 style={sectionTitleStyle}>Description</h2>
                            {hasAiContent && <AiBadge />}
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#46434f', margin: 0, whiteSpace: 'pre-line' }}>
                            {product.description?.trim()
                                ? product.description
                                : 'Product details coming soon.'}
                        </p>
                    </div>
                    {/* Key features: backed by ProductResponse.features. */}
                    <FeatureList product={product} />

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={outOfStock || addToCart.isPending}
                        style={{
                            ...addBtnStyle,
                            opacity: outOfStock ? 0.5 : 1,
                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {addToCart.isPending ? (
                            <>
                                <Spinner /> Adding…
                            </>
                        ) : outOfStock ? (
                            'Out of stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>
            </div>

            {/* Reviews section */}
            <section style={{ marginTop: 56 }}>
                <h2 style={{ ...sectionTitleStyle, fontSize: 22 }}>
                    Reviews{reviewsData ? ` (${reviewsData.totalCount})` : ''}
                </h2>

                {/* --- Write / manage YOUR review --- */}
                {canWrite ? (
                    myReview ? (
                        editing ? (
                            <ReviewForm
                                initialRating={myReview.rating}
                                initialComment={myReview.comment ?? ''}
                                submitLabel="Save changes"
                                pending={edit.isPending}
                                onSubmit={(rating, comment) =>
                                    edit.mutate({ reviewId: myReview.reviewId, rating, comment })}
                                onCancel={() => setEditing(false)}
                            />
                        ) : (
                            <div style={{ background: '#fff', border: '1px solid #eceaf2', borderRadius: 14, padding: '16px 18px', marginTop: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <span style={{ fontWeight: 700, fontSize: 14.5, color: '#15131f' }}>Your review</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {canEditMyReview && (
                                            <button onClick={() => setEditing(true)} style={smallBtnStyle}>Edit</button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Delete your review? This cannot be undone.')) {
                                                    remove.mutate(myReview.reviewId);
                                                }
                                            }}
                                            disabled={remove.isPending}
                                            style={{ ...smallBtnStyle, color: '#c0392b', borderColor: '#f3c7c0' }}
                                        >
                                            {remove.isPending ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 2, margin: '8px 0' }}>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <Star key={i} size={16}
                                              fill={i < myReview.rating ? '#f5a524' : 'none'}
                                              stroke={i < myReview.rating ? '#f5a524' : '#cbc8d6'} />
                                    ))}
                                </div>
                                {myReview.comment && (
                                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#46434f', margin: 0 }}>{myReview.comment}</p>
                                )}
                                {!canEditMyReview && (
                                    <p style={{ fontSize: 12, color: '#9a97a8', margin: '8px 0 0' }}>
                                        The 48-hour edit window has passed — you can still delete it.
                                    </p>
                                )}
                            </div>
                        )
                    ) : (
                        <div style={{ marginTop: 14 }}>
                            <h3 style={{ ...sectionTitleStyle, fontSize: 15 }}>Write a review</h3>
                            <ReviewForm
                                submitLabel="Submit review"
                                pending={submit.isPending}
                                onSubmit={(rating, comment) => submit.mutate({ rating, comment })}
                            />
                        </div>
                    )
                ) : !isAuthenticated ? (
                    <button onClick={() => openAuth('login', 'buyer')} style={{ ...smallBtnStyle, marginTop: 14 }}>
                        Log in to write a review
                    </button>
                ) : (
                    <p style={{ color: '#9a97a8', fontSize: 14, marginTop: 14 }}>
                        Only customer accounts can write reviews.
                    </p>
                )}

                {reviewsLoading ? (
                    <p style={{ color: '#9a97a8', fontSize: 15 }}>Loading reviews…</p>
                ) : reviewsError ? (
                    <p style={{ color: '#c0392b', fontSize: 15 }}>Couldn’t load reviews. Please refresh the page.</p>
                ) : otherReviews.length === 0 ? (
                    <p style={{ color: '#9a97a8', fontSize: 15 }}>
                        {myReview ? 'No other reviews yet.' : 'No reviews yet. Be the first to review this product.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
                        {otherReviews.map((r) => <ReviewRow key={r.reviewId} review={r} />)}
                    </div>
                )}
            </section>
        </Shell>
    );
}

// ---------- small presentational helpers (kept in-file for this one page) ----------

// Page chrome: violet-tinted background, centered column, sticky logo header.
function Shell({ children }: { children: ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: '#f7f6fb', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#15131f', paddingBottom: 80 }}>
            <PageHeader crumbLabel="Product" />
            <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 28px 0' }}>{children}</main>
        </div>
    );
}

// One review row.
function ReviewRow({ review }: { review: ReviewResponse }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #eceaf2', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, color: '#15131f' }}>{review.reviewerName}</span>
                <span style={{ fontSize: 12.5, color: '#9a97a8' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div style={{ display: 'flex', gap: 2, margin: '8px 0' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16}
                          fill={i < review.rating ? '#f5a524' : 'none'}
                          stroke={i < review.rating ? '#f5a524' : '#cbc8d6'} />
                ))}
            </div>
            {review.comment && (
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#46434f', margin: 0 }}>{review.comment}</p>
            )}
        </div>
    );
}

// Key-features list, rendered with checkmarks. Backed by ProductResponse.features
// (populated by Admin's "Use This Content" AI flow — see ProductFormModal.tsx).
function FeatureList({ product }: { product: ProductResponse }) {
    const features = product.features ?? [];
    if (features.length === 0) return null;
    return (
        <div>
            <h2 style={sectionTitleStyle}>Key Features</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#46434f', fontSize: 15, lineHeight: 1.6 }}>
                        <Check size={17} style={{ flexShrink: 0, marginTop: 2, color: '#7c5cff' }} />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// A small badge indicating this product's content was generated with AI assistance.
function AiBadge() {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
            borderRadius: 999, background: 'rgba(124,92,255,.12)', color: '#7c5cff',
            fontSize: 11.5, fontWeight: 700,
        }}>
            <Sparkles size={12} /> AI-enhanced
        </span>
    );
}
function Spinner() {
    return (
        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
    );
}

// ---------- shared inline styles ----------
const imageWrapStyle: CSSProperties = { width: '100%', aspectRatio: '1/1', background: 'radial-gradient(circle at 50% 30%, #fbfaff, #efebf8)', border: '1px solid #eceaf2', borderRadius: 20, overflow: 'hidden' };
const sectionTitleStyle: CSSProperties = { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, color: '#15131f', margin: '0 0 8px' };
const addBtnStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, padding: '13px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, boxShadow: '0 10px 22px -10px rgba(124,92,255,.7)' };
const backLinkStyle: CSSProperties = { fontSize: 13.5, fontWeight: 600, color: '#8d6cff', textDecoration: 'none' };
const retryBtnStyle: CSSProperties = { padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, fontWeight: 700 };
const crumbStyle: CSSProperties = { color: '#9a97a8', textDecoration: 'none' };
const smallBtnStyle: CSSProperties = { padding: '6px 12px', borderRadius: 9, border: '1px solid #e2dff0', background: '#fff', color: '#56536a', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' };

// Turn an Axios error into the backend's human message (see ExceptionHandlingMiddleware).
// 400 validation errors live in data.errors ({ field: string[] }); everything else in data.detail.
function reviewErrorMessage(err: unknown): string {
    const data = (err as { response?: { data?: { detail?: string; errors?: Record<string, string[]> } } })?.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0]?.[0];
        if (first) return first;
    }
    return data?.detail ?? 'Something went wrong. Please try again.';
}
