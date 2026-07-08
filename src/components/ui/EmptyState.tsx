// src/components/ui/EmptyState.tsx
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description?: string;
    ctaLabel?: string;
    ctaTo?: string;       // use for a Link (e.g. "Shop Now" -> /products)
    onCtaClick?: () => void; // use for a button action (e.g. "Reset filters")
};

// One reusable empty state for Products / Cart / My Orders / anywhere else.
export function EmptyState({
    icon: Icon,
    title,
    description,
    ctaLabel,
    ctaTo,
    onCtaClick,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#efe8f6] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ea] text-[#ff5f6d]">
                <Icon className="h-9 w-9" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
                <p className="mx-auto mt-3 max-w-md text-gray-500">{description}</p>
            )}
            {ctaLabel && ctaTo && (
                <Link
                    to={ctaTo}
                    className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300 ease-out hover:scale-[1.01]"
                >
                    {ctaLabel}
                </Link>
            )}
            {ctaLabel && onCtaClick && !ctaTo && (
                <button
                    type="button"
                    onClick={onCtaClick}
                    className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300 ease-out hover:scale-[1.01]"
                >
                    {ctaLabel}
                </button>
            )}
        </div>
    );
}