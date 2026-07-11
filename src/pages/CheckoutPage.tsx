import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    PackageCheck,
    ShoppingCart,
    Store,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCart } from '../api/cart';
import type { CartItem } from '../api/cart';
import { placeOrder } from '../api/orders';
import { createPayment, type PaymentMethod } from '../api/payments';
/* ---------------------------------------------------------------------- */
/* Stepper — extracted outside CartPage so it doesn't re-render on every  */
/* state change inside the page.                                           */
/* ---------------------------------------------------------------------- */
function CartSteps() {
    const steps = ['Cart', 'Checkout', 'Payment'];
    const activeIndex = 1; // Checkout is step 1
    return (
        <div className="mb-10 flex justify-center px-2">
            <div className="flex items-center gap-2 sm:gap-4">
                {steps.map((step, i) => {
                    const isActive = i === activeIndex;
                    const isDone = i < activeIndex;
                    return (
                        <div key={step} className="flex items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full transition-all duration-500 ${isActive
                                        ? 'animate-pulse scale-100 bg-[#7c5cff] shadow-[0_0_0_4px_rgba(124,92,255,0.18)]'
                                        : isDone
                                            ? 'scale-100 bg-[#8d6cff]'
                                            : 'scale-75 bg-gray-300'
                                        }`}
                                />
                                <span
                                    className={`text-sm sm:text-lg font-semibold whitespace-nowrap transition-colors duration-500 ${isActive
                                        ? 'bg-gradient-to-r from-[#8d6cff] to-[#7c5cff] bg-clip-text text-transparent'
                                        : 'text-gray-400'
                                        }`}
                                >
                                    {step}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="relative h-px w-6 sm:w-20 shrink-0 overflow-hidden border-t-2 border-dashed border-[#d7d1e8]">
                                    <div
                                        className={`absolute inset-y-0 left-0 border-t-2 border-dashed border-[#8d6cff] transition-all duration-700 ease-out ${i < activeIndex ? 'w-full' : 'w-0'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
/* ---------------------------------------------------------------------- */
/* Payment method options                                                  */
/* ---------------------------------------------------------------------- */
type ShippingForm = {
    street: string;
    line2: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
};
const initialShippingForm: ShippingForm = {
    street: '',
    line2: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: '',
};
const paymentMethods: {
    value: PaymentMethod;
    label: string;
    description: string;
    imageSrc: string;
}[] = [
        {
            value: 'CreditCard',
            label: 'Credit Card',
            description: 'Pay with Visa or Mastercard.',
            imageSrc: '/payment-methods/visa.png',
        },
        {
            value: 'DebitCard',
            label: 'Debit Card',
            description: 'Fast local payments via Whish Money.',
            imageSrc: '/payment-methods/wish-money.png',
        },
        {
            value: 'PayPal',
            label: 'PayPal',
            description: 'Pay quickly with PayPal.',
            imageSrc: '/payment-methods/paypal.png',
        },
    ];
/* ---------------------------------------------------------------------- */
/* CheckoutPage                                                            */
/* ---------------------------------------------------------------------- */
export function CheckoutPage() {
    const navigate = useNavigate();
    const [shippingForm, setShippingForm] = useState<ShippingForm>(initialShippingForm);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CreditCard');
    const [formError, setFormError] = useState('');
    const [apiError, setApiError] = useState('');
    const orderFlowStartedRef = useRef(false);
    const {
        data: cart,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
        refetchOnWindowFocus: true,
    });
    const storeGroups = useMemo(() => {
        if (!cart) return [];
        const map = new Map<number, { storeId: number; storeName: string; items: CartItem[] }>();
        for (const item of cart.items) {
            if (!map.has(item.storeId)) {
                map.set(item.storeId, { storeId: item.storeId, storeName: item.storeName, items: [] });
            }
            map.get(item.storeId)!.items.push(item);
        }
        return Array.from(map.values());
    }, [cart]);
    useEffect(() => {
        if (
            !isLoading &&
            !isError &&
            cart &&
            cart.items.length === 0 &&
            !orderFlowStartedRef.current
        ) {
            navigate('/cart', { replace: true });
        }
    }, [isLoading, isError, cart, navigate]);
    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const order = await placeOrder({
                shippingLine1: shippingForm.street.trim(),
                shippingLine2: shippingForm.line2.trim() || null,
                shippingCity: shippingForm.city.trim(),
                shippingState: shippingForm.stateRegion.trim(),
                shippingPostalCode: shippingForm.postalCode.trim(),
                shippingCountry: shippingForm.country.trim(),
            });
            try {
                await createPayment({
                    orderId: order.orderId,
                    paymentMethod,
                });
            } catch (paymentError) {
                if (axios.isAxiosError(paymentError) && paymentError.response?.status === 409) {
                    toast('Order placed. Payment already recorded.', { icon: '⚠️' });
                    return order.orderId;
                }
                throw paymentError;
            }
            return order.orderId;
        },
        onSuccess: (orderId) => {
            toast.success('Order placed successfully.');
            navigate(`/orders/${orderId}/confirmation`);
        },
        onError: (error) => {
            const message = getCheckoutErrorMessage(error);
            setApiError(message);
            toast.error(message);
        },
    });
    function formatMoney(value: number) {
        return `$${Number(value || 0).toFixed(2)}`;
    }
    function updateShippingField(field: keyof ShippingForm, value: string) {
        setShippingForm((prev) => ({ ...prev, [field]: value }));
        setFormError('');
        setApiError('');
    }
    function validateForm() {
        if (!shippingForm.street.trim()) return 'Street address is required.';
        if (!shippingForm.city.trim()) return 'City is required.';
        if (!shippingForm.stateRegion.trim()) return 'State / region is required.';
        if (!shippingForm.postalCode.trim()) return 'Postal code is required.';
        if (!shippingForm.country.trim()) return 'Country is required.';
        return '';
    }
    function handlePlaceOrder() {
        if (outOfStockItems.length > 0) {
            toast.error('Please resolve out-of-stock items before placing your order.');
            return;
        }
        const validationMessage = validateForm();
        if (validationMessage) {
            setFormError(validationMessage);
            toast.error(validationMessage);
            return;
        }
        setFormError('');
        setApiError('');
        orderFlowStartedRef.current = true;
        checkoutMutation.mutate();
    }
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)]">
                <Loader2 className="h-10 w-10 animate-spin text-[#7c5cff]" />
            </div>
        );
    }
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)] px-4">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-[#efe8f6]">
                    <p className="text-lg font-semibold text-gray-900">Failed to load checkout.</p>
                    <p className="mt-2 text-sm text-gray-500">Please refresh the page and try again.</p>
                </div>
            </div>
        );
    }
    if (!cart || cart.items.length === 0) {
        return null;
    }
    const isPlacingOrder = checkoutMutation.isPending;
    const outOfStockItems = cart.items.filter(
        (item) => item.quantityInStock <= 0 || item.quantity > item.quantityInStock,
    );
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)]">
            <div className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <CartSteps />
                    <div className="mb-8">
                        <Link
                            to="/cart"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7c5cff] transition hover:text-[#6d28d9]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to cart
                        </Link>
                        <div className="mt-4 flex items-end justify-between gap-4 border-b border-[#d7d1e8] pb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

                            </div>
                            <div className="hidden rounded-full border border-[#e3d9ff] bg-white px-4 py-2 text-sm font-semibold text-[#7c5cff] shadow-sm md:inline-flex md:items-center md:gap-2">
                                <PackageCheck className="h-4 w-4" />
                                Secure checkout
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                        {/* LEFT COLUMN */}
                        <div className="space-y-5">
                            {/* Shipping Address */}
                            <section className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#efeaff] text-[#7c5cff]">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                                        <p className="text-sm text-gray-500">All fields are required.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Street address
                                        </label>
                                        <input
                                            type="text"
                                            value={shippingForm.street}
                                            onChange={(e) => updateShippingField('street', e.target.value)}
                                            placeholder="Street address"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Additional address
                                            <span className="ml-1 font-normal text-gray-400"></span>
                                        </label>
                                        <input
                                            type="text"
                                            value={shippingForm.line2}
                                            onChange={(e) => updateShippingField('line2', e.target.value)}
                                            placeholder="Apartment, suite, floor, building"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={shippingForm.city}
                                            onChange={(e) => updateShippingField('city', e.target.value)}
                                            placeholder="Beirut"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            State / Region
                                        </label>
                                        <input
                                            type="text"
                                            value={shippingForm.stateRegion}
                                            onChange={(e) => updateShippingField('stateRegion', e.target.value)}
                                            placeholder="Mount Lebanon"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Postal code
                                        </label>
                                        <input
                                            type="text"
                                            value={shippingForm.postalCode}
                                            onChange={(e) => updateShippingField('postalCode', e.target.value)}
                                            placeholder="0000"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Country</label>
                                        <input
                                            type="text"
                                            value={shippingForm.country}
                                            onChange={(e) => updateShippingField('country', e.target.value)}
                                            placeholder="Lebanon"
                                            className="w-full rounded-xl border border-[#e7e1f2] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#8d6cff] focus:ring-2 focus:ring-[#e3d9ff]"
                                        />
                                    </div>
                                </div>
                                {formError && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                        {formError}
                                    </div>
                                )}
                            </section>
                            {/* Payment Method */}
                            <section className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#efeaff] text-[#7c5cff]">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                                        <p className="text-sm text-gray-500">Choose how you want to pay.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {paymentMethods.map((method) => {
                                        const isSelected = paymentMethod === method.value;
                                        return (
                                            <label
                                                key={method.label}
                                                className={`flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4 transition-all duration-300 ${isSelected
                                                        ? 'border-[#b3a1ff] bg-[#f5f2ff] shadow-[0_12px_24px_rgba(124,92,255,0.10)]'
                                                        : 'border-[#e7e1f2] bg-white hover:border-[#d9ccff] hover:bg-[#f8f6ff]'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.value}
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setPaymentMethod(method.value);
                                                        setApiError('');
                                                    }}
                                                    className="h-4 w-4 accent-[#7c5cff]"
                                                />
                                                {/* Payment logo card */}
                                                <div
                                                    className={`flex h-12 w-20 shrink-0 items-center justify-center rounded-xl border p-2 transition-all duration-300 ${isSelected
                                                            ? 'border-[#c9b8ff] bg-white shadow-[0_4px_12px_rgba(124,92,255,0.12)]'
                                                            : 'border-[#f0edf7] bg-[#faf9fc]'
                                                        }`}
                                                >
                                                    <img
                                                        src={method.imageSrc}
                                                        alt={method.label}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900">{method.label}</p>
                                                    <p className="text-sm text-gray-500">{method.description}</p>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-[#7c5cff]" />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                        {/* RIGHT COLUMN — Order Summary */}
                        <aside className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm lg:sticky lg:top-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#efeaff] text-[#7c5cff]">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                                    <p className="text-sm text-gray-500">
                                        {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <div className="max-h-[360px] space-y-5 overflow-auto pr-1">
                                {storeGroups.map((group) => (
                                    <div key={group.storeId}>
                                        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                                            <Store className="h-3.5 w-3.5 text-[#7c5cff]" />
                                            {group.storeName}
                                        </div>
                                        <div className="space-y-3">
                                            {group.items.map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="flex gap-3 rounded-xl border border-[#f0edf7] bg-[#faf9fc] p-3"
                                                >
                                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0edf7] bg-white">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <ShoppingCart className="h-6 w-6 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold text-gray-900">{item.productName}</p>
                                                        <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        <p className="mt-1 font-bold text-gray-900">{formatMoney(item.lineTotal)}</p>
                                                        {item.quantityInStock <= 0 ? (
                                                            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Out of stock
                                                            </p>
                                                        ) : item.quantity > item.quantityInStock ? (
                                                            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Only {item.quantityInStock} left
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-4 border-t border-[#f0edf7] pt-5">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatMoney(cart.subtotal)}</span>
                                </div>
                                {cart.couponCode && cart.discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-{formatMoney(cart.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-[#f0edf7] pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatMoney(cart.finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {outOfStockItems.length > 0 && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    <p className="mb-1.5 flex items-center gap-1.5 font-semibold">
                                        <AlertTriangle className="h-4 w-4" />
                                        Fix these items before you can pay
                                    </p>
                                    <ul className="list-disc space-y-0.5 pl-5">
                                        {outOfStockItems.map((item) => (
                                            <li key={item.productId}>
                                                {item.productName} —{' '}
                                                {item.quantityInStock <= 0
                                                    ? 'out of stock'
                                                    : `only ${item.quantityInStock} available, you have ${item.quantity} in cart`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {apiError && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                    {apiError}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || outOfStockItems.length > 0}
                                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8d6cff] to-[#7c5cff] px-5 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(124,92,255,0.28)] transition duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(124,92,255,0.34)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                            >
                                {isPlacingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPlacingOrder ? 'Placing order...' : outOfStockItems.length > 0 ? 'Resolve stock issues to continue' : 'Place Order'}
                            </button>
                            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                                By placing your order, you confirm your shipping and payment details.
                            </p>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
function getCheckoutErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        if (typeof data === 'string') return data;
        if (data?.message) return data.message;
        if (data?.detail) return data.detail;
        if (data?.title) return data.title;
        if (data?.errors) {
            const firstError = Object.values(data.errors).flat()[0];
            if (typeof firstError === 'string') return firstError;
        }
        if (status === 400 || status === 409) {
            return 'Unable to place order. Some items may be out of stock.';
        }
    }
    if (error instanceof Error) return error.message;
    return 'Something went wrong while placing your order.';
}