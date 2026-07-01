// src/api/payments.ts
// All payment API calls: the customer checkout flow (createPayment / fetchPaymentByOrderId)
// AND the admin payments/refunds tab (fetchAdminPayments / refundPayment, TB-136).
import axiosInstance from './axiosInstance';
import type { PaginatedResult } from '../types/product';
import type { PaymentRow } from '../types/payment';

// ---------- CUSTOMER CHECKOUT ----------

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal';

export interface ProcessPaymentRequest {
    orderId: number;
    paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
    paymentId: number;
    orderId: number;
    amount: number;
    method: string;
    status: string;
    transactionId: string | null;
    paidAt: string | null;
}

export async function createPayment(request: ProcessPaymentRequest): Promise<PaymentResponse> {
    const res = await axiosInstance.post<PaymentResponse>('/api/v1/payments', request);
    return res.data;
}

export async function fetchPaymentByOrderId(orderId: number): Promise<PaymentResponse> {
    const res = await axiosInstance.get<PaymentResponse>(`/api/v1/payments/${orderId}`);
    return res.data;
}

// ---------- ADMIN PAYMENTS / REFUNDS (TB-136) ----------

// The query params the admin payments list accepts. All optional (paging has backend defaults).
export interface AdminPaymentParams {
    page?: number;
    pageSize?: number;
    status?: string;   // omit for "All"
}

// LIST all payments (paginated, newest first). GET /api/v1/admin/payments
export async function fetchAdminPayments(
    params: AdminPaymentParams,
): Promise<PaginatedResult<PaymentRow>> {
    const res = await axiosInstance.get<PaginatedResult<PaymentRow>>(
        '/api/v1/admin/payments',
        { params }, // axios builds ?page=1&pageSize=10&status=Paid ; undefined values are dropped
    );
    return res.data;
}

// REFUND a paid payment. POST /api/v1/admin/payments/{paymentId}/refund
// IMPORTANT: the id in the URL is the PAYMENT id (payment.paymentId), NOT the order id.
// IMPORTANT: this POST has NO request body — the id in the URL is all the backend needs.
export async function refundPayment(paymentId: number): Promise<PaymentRow> {
    const res = await axiosInstance.post<PaymentRow>(
        `/api/v1/admin/payments/${paymentId}/refund`,
    );
    return res.data;
}