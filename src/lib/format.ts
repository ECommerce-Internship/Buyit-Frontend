// 1234.5 -> "$1,234.50"
export function formatCurrency(value: number): string {
    const v = Number(value) || 0;
    const fraction = Number.isInteger(v) ? 0 : 2; // $128, but $128.50
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: fraction, maximumFractionDigits: fraction,
    }).format(v);
}

// Stock badge logic, in one place.
export type StockLevel = 'in' | 'low' | 'out';

// 5 or fewer left counts as "Low Stock". Change this one number to retune.
export const LOW_STOCK_THRESHOLD = 5;

export function stockLevel(quantity: number): StockLevel {
    if (quantity <= 0) return 'out';
    if (quantity <= LOW_STOCK_THRESHOLD) return 'low';
    return 'in';
}

// Human label for each level (used by the badge).
export const STOCK_LABEL: Record<StockLevel, string> = {
    in: 'In Stock',
    low: 'Low Stock',
    out: 'Out of Stock',
};