// src/components/products/StarRating.tsx
// Recreated from the "Buyit Rating Row" design handoff: 3D beveled stars with
// fractional gold fill, animated tilt + shine, numeric rating, count, and a
// dedicated "No reviews yet" empty state. Contract kept as { rating, count }.

interface StarRatingProps {
    rating: number;     // averageRating (0–5, may be fractional e.g. 4.2)
    count: number;      // reviewCount
    scale?: number;     // optional visual scale (design's `scale` prop); default 1
}

// The exact star outline from the design.
const STAR_CLIP =
    'polygon(50% 2%,61% 35%,96% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,4% 35%,39% 35%)';

export function StarRating({ rating, count, scale = 1 }: StarRatingProps) {
    const hasReviews = count > 0;
    const effective = Math.max(0, Math.min(5, rating)); // clamp to 0–5

    return (
        <div
            aria-label={hasReviews ? `${effective.toFixed(1)} out of 5 (${count} reviews)` : 'No reviews yet'}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1,
                whiteSpace: 'nowrap', transform: `scale(${scale})`, transformOrigin: 'center center',
            }}
        >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, perspective: 640 }}>
                {[0, 1, 2, 3, 4].map((i) => {
                    const fill = Math.max(0, Math.min(1, effective - i)); // 0..1 of this star
                    return (
                        <div
                            key={i}
                            style={{
                                position: 'relative', width: 20, height: 20,
                                transformStyle: 'preserve-3d',
                                filter: 'drop-shadow(0 1.6px 2px rgba(33,31,43,.2))',
                                animation: 'bitilt 5s ease-in-out infinite',
                                animationDelay: `${(i * -0.6).toFixed(2)}s`,
                            }}
                        >
                            {/* back / drop-shadow plate */}
                            <div style={{ position: 'absolute', inset: 0, clipPath: STAR_CLIP, background: '#cf8a13', transform: 'translateY(1.7px)' }} />
                            {/* empty (unfilled) face */}
                            <div style={{ position: 'absolute', inset: 0, clipPath: STAR_CLIP, background: 'linear-gradient(150deg,#edeaf2,#dbd8e3)' }} />
                            {/* gold fill, width = fraction of this star */}
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', overflow: 'hidden', width: `${(fill * 100).toFixed(2)}%` }}>
                                <div style={{ width: 20, height: 20, clipPath: STAR_CLIP, background: 'linear-gradient(150deg,#ffe08a 0%,#f5a524 52%,#df8709 100%)' }} />
                            </div>
                            {/* glossy top-left highlight */}
                            <div style={{ position: 'absolute', inset: 0, clipPath: STAR_CLIP, background: 'radial-gradient(circle at 33% 23%, rgba(255,255,255,.92), rgba(255,255,255,0) 46%)', pointerEvents: 'none' }} />
                            {/* moving shine sweep */}
                            <div style={{ position: 'absolute', inset: 0, clipPath: STAR_CLIP, overflow: 'hidden', pointerEvents: 'none' }}>
                                <div style={{ position: 'absolute', top: '-25%', left: 0, width: '32%', height: '150%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.92),transparent)', transform: 'translateX(-240%) skewX(-22deg)', animation: 'bishine 3.4s ease-in-out infinite', animationDelay: `${(i * 0.22).toFixed(2)}s` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasReviews ? (
                <>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: '#211f2b' }}>
                        {effective.toFixed(1)}
                    </span>
                    <span style={{ fontWeight: 500, fontSize: 14, color: '#6b6878' }}>
                        ({count.toLocaleString('en-US')})
                    </span>
                </>
            ) : (
                <span style={{ fontWeight: 500, fontSize: 14, color: '#6b6878' }}>No reviews yet</span>
            )}
        </div>
    );
}