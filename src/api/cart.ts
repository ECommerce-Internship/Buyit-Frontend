import axiosInstance from './axiosInstance';

// Add a product to the logged-in customer's cart.
// Requires an authenticated CUSTOMER (the backend cart controller is
// [Authorize(Roles = "Customer")]). The shared axiosInstance attaches the token.
export async function addCartItem(productId: number, quantity: number): Promise<void> {
    await axiosInstance.post('/api/v1/cart/items', { productId, quantity });
export interface CartItem {
    productId: number;
    productName: string;
    sku?: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    couponCode: string | null;
    discountPercentage: number;
    discountAmount: number;
    finalTotal: number;
}

export async function fetchCart(): Promise<Cart> {
    const res = await axiosInstance.get<Cart>('/api/v1/cart');
    return res.data;
}

export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
    const res = await axiosInstance.put<Cart>(`/api/v1/cart/items/${productId}`, {
        quantity,
    });

    return res.data;
}

export async function removeCartItem(productId: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/cart/items/${productId}`);
}

export async function applyCoupon(code: string): Promise<Cart> {
    const res = await axiosInstance.post<Cart>('/api/v1/cart/coupon', {
        code,
    });

    return res.data;
}

export async function removeCoupon(): Promise<Cart> {
    const res = await axiosInstance.delete<Cart>('/api/v1/cart/coupon');
    return res.data;
}