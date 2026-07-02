import axiosInstance from './axiosInstance';

export type PaymentMethod = 'CreditCard' | 'DebitCard' | 'PayPal';

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