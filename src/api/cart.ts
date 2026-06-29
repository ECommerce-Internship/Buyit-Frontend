import axiosInstance from './axiosInstance';

// Add a product to the logged-in customer's cart.
// Requires an authenticated CUSTOMER (the backend cart controller is
// [Authorize(Roles = "Customer")]). The shared axiosInstance attaches the token.
export async function addCartItem(productId: number, quantity: number): Promise<void> {
    await axiosInstance.post('/api/v1/cart/items', { productId, quantity });
}