import axiosInstance from './axiosInstance';

export interface StoreOrderItemResponse {
    storeOrderItemId: number;
    productId: number;
    productName: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface StoreOrderResponse {
    storeOrderId: number;
    orderId: number;
    orderDate: string;
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
    shippingState: string;
    shippingCountry: string;
    paymentStatus: string | null;
    storeOrders: StoreOrderResponse[];
}

export interface OrderSummary {
    orderId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    storeOrderCount: number;
    itemCount: number;
    paymentStatus: string | null;
}

export interface MyOrdersResponse {
    items: OrderSummary[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export async function placeOrder(request: PlaceOrderRequest): Promise<OrderResponse> {
    const res = await axiosInstance.post<OrderResponse>('/api/v1/orders', request);
    return res.data;
}

export async function fetchMyOrders(page: number, pageSize: number): Promise<MyOrdersResponse> {
    const res = await axiosInstance.get<MyOrdersResponse>('/api/v1/orders', {
        params: {
            page,
            pageSize,
        },
    });

    return res.data;
}

export async function fetchOrderById(orderId: number): Promise<OrderResponse> {
    const res = await axiosInstance.get<OrderResponse>(`/api/v1/orders/${orderId}`);
    return res.data;
}

export async function cancelStoreOrder(storeOrderId: number): Promise<void> {
    await axiosInstance.put(`/api/v1/orders/store-orders/${storeOrderId}/cancel`);
}