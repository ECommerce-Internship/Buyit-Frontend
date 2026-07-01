import axiosInstance from './axiosInstance';

export interface StoreOrderItemResponse {
    storeOrderItemId: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface StoreOrderResponse {
    storeOrderId: number;
    storeId: number;
    storeName: string;
    status: string;
    subTotal: number;
    commissionAmount: number;
    sellerNetAmount: number;
    items: StoreOrderItemResponse[];
}

export interface PlaceOrderRequest {
    shippingLine1: string;
    shippingLine2: string | null;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry: string;
}

export interface OrderResponse {
    orderId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    discountAmount: number;
    shippingLine1: string;
    shippingLine2: string | null;
    shippingCity: string;
    shippingPostalCode: string;
    shippingCountry: string;
    paymentStatus: string | null;
    storeOrders: StoreOrderResponse[];
}

export async function placeOrder(request: PlaceOrderRequest): Promise<OrderResponse> {
    const res = await axiosInstance.post<OrderResponse>('/api/v1/orders', request);
    return res.data;
}

export async function fetchOrderById(orderId: number): Promise<OrderResponse> {
    const res = await axiosInstance.get<OrderResponse>(`/api/v1/orders/${orderId}`);
    return res.data;
}