// src/components/ui/Skeleton.tsx
import type { CSSProperties } from 'react';

type SkeletonProps = {
    className?: string;
    style?: CSSProperties;
};

// The one primitive every skeleton in the app should compose from.
// Plain gray block, Tailwind's animate-pulse — nothing else.
export function Skeleton({ className = '', style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 ${className}`}
            style={style}
        />
    );
}