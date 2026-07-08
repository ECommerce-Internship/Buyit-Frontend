// src/components/products/ReviewForm.tsx
// A reusable star-rating + comment form. Used for BOTH creating and editing a review.
import { useState, type CSSProperties, type FormEvent } from 'react';
import { Star } from 'lucide-react';

const MAX_COMMENT = 1000; // must match the backend's SubmitReviewRequestValidator rule

interface ReviewFormProps {
    initialRating?: number;   // 0 for a new review; the existing rating when editing
    initialComment?: string;  // '' for a new review; the existing text when editing
    submitLabel: string;      // e.g. "Submit review" or "Save changes"
    pending: boolean;         // true while the request is in flight -> disable + show "Saving…"
    onSubmit: (rating: number, comment: string | null) => void;
    onCancel?: () => void;    // optional: shows a Cancel button (used in edit mode)
}

export function ReviewForm({
    initialRating = 0,
    initialComment = '',
    submitLabel,
    pending,
    onSubmit,
    onCancel,
}: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);          // which star the mouse is currently over
    const [comment, setComment] = useState(initialComment);

    // You may only submit a real 1-5 rating, within the length limit, when not already saving.
    const canSubmit = rating >= 1 && rating <= 5 && comment.length <= MAX_COMMENT && !pending;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();                 // stop the browser's default full-page reload
        if (!canSubmit) return;
        const trimmed = comment.trim();
        onSubmit(rating, trimmed === '' ? null : trimmed); // empty comment -> null (star-only)
    }

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            {/* Star picker: 5 buttons; highlight up to hovered (or selected) star */}
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hover || rating) >= n;
                    return (
                        <button
                            type="button"               // NOT "submit" — clicking a star must not submit
                            key={n}
                            onClick={() => setRating(n)}
                            onMouseEnter={() => setHover(n)}
                            onMouseLeave={() => setHover(0)}
                            aria-label={`${n} star${n > 1 ? 's' : ''}`}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                            <Star size={26} fill={active ? '#f5a524' : 'none'} stroke={active ? '#f5a524' : '#cbc8d6'} />
                        </button>
                    );
                })}
            </div>

            {/* Optional comment */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={MAX_COMMENT}
                rows={4}
                placeholder="Share your thoughts (optional)…"
                style={textareaStyle}
            />

            {/* Counter + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9a97a8' }}>{comment.length}/{MAX_COMMENT}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    {onCancel && (
                        <button type="button" onClick={onCancel} style={cancelStyle}>Cancel</button>
                    )}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        style={{ ...submitStyle, opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                    >
                        {pending ? 'Saving…' : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}

const formStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', border: '1px solid #eceaf2', borderRadius: 14, padding: '16px 18px' };
const textareaStyle: CSSProperties = { resize: 'vertical', width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2dff0', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, color: '#15131f' };
const submitStyle: CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#8d6cff,#7c5cff)', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700 };
const cancelStyle: CSSProperties = { padding: '10px 16px', borderRadius: 10, border: '1px solid #e2dff0', background: '#fff', color: '#56536a', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' };
