import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Package, ShoppingBag, Store } from 'lucide-react';
import { fetchOrderById } from '../api/orders';
/* ---------------------------------------------------------------------- */
/* Stepper — Payment is the final step, activeIndex = 2 (all filled)      */
/* ---------------------------------------------------------------------- */
function CartSteps() {
    const steps = ['Cart', 'Checkout', 'Payment'];
    const activeIndex = 2;
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
                                        : isDone
                                            ? 'text-gray-500'
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
/* OrderConfirmationPage                                                   */
/* ---------------------------------------------------------------------- */
export function OrderConfirmationPage() {
    const { id } = useParams();
    const orderId = Number(id);
    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderById(orderId),
        enabled: Number.isFinite(orderId),
    });
    function formatMoney(value: number) {
        return `$${Number(value || 0).toFixed(2)}`;
    }
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)]">
                <Loader2 className="h-10 w-10 animate-spin text-[#7c5cff]" />
            </div>
        );
    }
    if (isError || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)] px-4">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-[#efe8f6]">
                    <p className="text-lg font-semibold text-gray-900">We couldn't load this order.</p>
                    <p className="mt-2 text-sm text-gray-500">Please check your orders page.</p>
                </div>
            </div>
        );
    }
    const allItems = order.storeOrders.flatMap((so) => so.items);
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#f5f2ff_100%)] px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <CartSteps />
                {/* Success header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#8d6cff] to-[#7c5cff] shadow-[0_16px_35px_rgba(124,92,255,0.30)]">
                        <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Order confirmed!</h1>
                    <p className="mt-2 text-gray-500">
                        Thank you for your purchase. We'll get this to you soon.
                    </p>
                </div>
                {/* Order ID badge */}
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e3d9ff] bg-white px-5 py-2 shadow-sm">
                        <Package className="h-4 w-4 text-[#7c5cff]" />
                        <span className="text-sm font-semibold text-gray-500">Order</span>
                        <span className="font-bold text-[#7c5cff]">#{order.orderId}</span>
                    </div>
                </div>
                {/* Items, grouped per store */}
                <div className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-bold text-gray-900">
                        Items ordered
                        <span className="ml-2 text-sm font-normal text-gray-400">
                            ({allItems.length} {allItems.length === 1 ? 'item' : 'items'} from {order.storeOrders.length} {order.storeOrders.length === 1 ? 'seller' : 'sellers'})
                        </span>
                    </h2>
                    <div className="space-y-5">
                        {order.storeOrders.map((storeOrder) => (
                            <div key={storeOrder.storeOrderId} className="overflow-hidden rounded-xl border border-[#f0edf7]">
                                <div className="flex items-center justify-between gap-2 border-b border-[#f0edf7] bg-[#faf9fc] px-4 py-2.5">
                                    <div className="flex items-center gap-1.5">
                                        <Store className="h-3.5 w-3.5 text-[#7c5cff]" />
                                        <span className="text-sm font-bold text-gray-700">{storeOrder.storeName}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-400">Order #{storeOrder.storeOrderId}</span>
                                </div>
                                <div className="space-y-3 p-3">
                                    {storeOrder.items.map((item) => (
                                        <div
                                            key={item.storeOrderItemId}
                                            className="flex items-center gap-4 rounded-xl bg-white p-2"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#f0edf7] bg-[#faf9fc]">
                                                <ShoppingBag className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="shrink-0 font-bold text-gray-900">{formatMoney(item.lineTotal)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between border-t border-[#f0edf7] bg-[#faf9fc] px-4 py-2.5">
                                    <span className="text-xs font-semibold text-gray-500">Store subtotal</span>
                                    <span className="text-sm font-bold text-gray-900">{formatMoney(storeOrder.subTotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Totals */}
                    <div className="mt-5 space-y-2 border-t border-[#f0edf7] pt-5">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900">{formatMoney(order.totalAmount + order.discountAmount)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">-{formatMoney(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between border-t border-[#f0edf7] pt-3">
                            <span className="text-lg font-bold text-gray-900">Total paid</span>
                            <span className="text-lg font-bold text-[#7c5cff]">{formatMoney(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/orders"
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#e7e1f2] bg-white px-6 py-3 font-semibold text-gray-600 shadow-sm transition duration-300 ease-out hover:border-[#d9ccff] hover:bg-[#f5f2ff] hover:text-[#7c5cff]"
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/products"
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#8d6cff] to-[#7c5cff] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(124,92,255,0.28)] transition duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(124,92,255,0.34)]"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}