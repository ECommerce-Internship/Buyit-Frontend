// src/types/payment.ts
// The shape of ONE payment row as GET /api/v1/admin/payments returns it (TB-136).
// Mirrors the backend PaymentResponse record field-for-field (camelCase on the wire).
export interface PaymentRow {
    paymentId: number;        // the payment's own id — pass THIS to the refund endpoint
    orderId: number;          // which order this payment is for
    amount: number;           // money, e.g. 128.5
    method: string;           // "CreditCard" | "DebitCard" | "PayPal"
    status: string;           // "Pending" | "Paid" | "Failed" | "Refunded"
    transactionId: string | null;  // a random hex string, or null
    paidAt: string | null;          // ISO date string (e.g. "2026-06-30T12:50:00Z"), or null
    customerName: string | null;    // filled by the §6 backend fix; null until then → shown as "—"
    customerEmail: string | null;   // (not shown in the table, but available if you want a tooltip)
}