// src/api/payments.ts
// The ONLY place that knows the admin payments backend URLs (TB-136).
import axiosInstance from './axiosInstance';
import type { PaginatedResult } from '../types/product';
import type { PaymentRow } from '../types/payment';

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