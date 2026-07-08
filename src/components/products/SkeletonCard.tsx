// src/components/products/SkeletonCard.tsx
import { Skeleton } from '../ui/Skeleton';

export function SkeletonCard() {
    return (
        <div style={{ width: '100%', background: '#fff', border: '1px solid #eceaf2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(21,19,31,.04)' }}>
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="flex flex-col gap-3 p-4">
                <Skeleton className="h-3.5 w-[90%]" />
                <Skeleton className="h-3.5 w-[62%]" />
                <Skeleton className="mt-0.5 h-2.5 w-[44%]" />
                <div className="mt-2 flex items-center justify-between">
                    <Skeleton className="h-5 w-[34%]" />
                    <Skeleton className="h-[22px] w-[30%] rounded-full" />
                </div>
            </div>
        </div>
    );
}