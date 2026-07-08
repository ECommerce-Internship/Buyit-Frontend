// src/lib/orderStatus.ts
// The five OrderStatus names the backend accepts (§5.8), plus a display colour each.

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const;
export type OrderStatusName = (typeof ORDER_STATUSES)[number];

// Colour for the badge/dot per status. Falls back to grey for anything unexpected.
export function statusColor(status: string): string {
    switch (status) {
        case 'Pending': return '#ffcd8a'; // amber  — waiting
        case 'Confirmed': return '#8ab4ff'; // blue   — accepted
        case 'Shipped': return '#c4b5fd'; // purple — in transit
        case 'Delivered': return '#8be0a4'; // green  — done
        case 'Cancelled': return '#ff8fa3'; // red    — cancelled
        default: return 'rgba(255,255,255,0.6)';
    }
}