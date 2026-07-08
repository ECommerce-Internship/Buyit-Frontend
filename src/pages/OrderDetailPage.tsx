import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { animate, motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    Package,
    ReceiptText,
    ShoppingBag,
    Store,
    Truck,
    XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { cancelStoreOrder, fetchOrderById } from '../api/orders';
import { fetchPaymentByOrderId } from '../api/payments';

/* ---------------------------------------------------------------------- */
/* Animation variants                                                      */
/* ---------------------------------------------------------------------- */

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' as const },
    },
};

const slideLeft = {
    hidden: { opacity: 0, x: -32 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.45, ease: 'easeOut' as const },
    },
};

const slideRight = {
    hidden: { opacity: 0, x: 32 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.45, ease: 'easeOut' as const },
    },
};

const storeCardVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const storeItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' as const },
    },
};

const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
    },
};

/* ---------------------------------------------------------------------- */
/* Animated counters                                                       */
/* ---------------------------------------------------------------------- */

function AnimatedMoney({
    value,
    delay = 0,
    className = '',
}: {
    value: number;
    delay?: number;
    className?: string;
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const currentValueRef = useRef(0);

    useEffect(() => {
        const controls = animate(currentValueRef.current, value, {
            duration: 0.85,
            delay,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (latest) => {
                currentValueRef.current = latest;
                setDisplayValue(latest);
            },
            onComplete: () => {
                currentValueRef.current = value;
                setDisplayValue(value);
            },
        });

        return () => controls.stop();
    }, [value, delay]);

    return (
        <motion.span
            className={`inline-block tabular-nums ${className}`}
            initial={{ scale: 0.96, opacity: 0.75 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay }}
        >
            ${displayValue.toFixed(2)}
        </motion.span>
    );
}

function AnimatedNumber({
    value,
    delay = 0,
    className = '',
}: {
    value: number;
    delay?: number;
    className?: string;
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const currentValueRef = useRef(0);

    useEffect(() => {
        const controls = animate(currentValueRef.current, value, {
            duration: 0.65,
            delay,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (latest) => {
                currentValueRef.current = latest;
                setDisplayValue(latest);
            },
            onComplete: () => {
                currentValueRef.current = value;
                setDisplayValue(value);
            },
        });

        return () => controls.stop();
    }, [value, delay]);

    return (
        <motion.span
            className={`inline-block tabular-nums ${className}`}
            initial={{ scale: 0.96, opacity: 0.75 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay }}
        >
            {Math.round(displayValue)}
        </motion.span>
    );
}

/* ---------------------------------------------------------------------- */
/* OrderDetailPage                                                         */
/* ---------------------------------------------------------------------- */

export function OrderDetailPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();

    const orderId = Number(id);
    const isValidOrderId = Number.isFinite(orderId) && orderId > 0;

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => fetchOrderById(orderId),
        enabled: isValidOrderId,
        refetchOnWindowFocus: true,
    });

    const { data: payment, isLoading: isPaymentLoading } = useQuery({
        queryKey: ['payment', orderId],
        queryFn: () => fetchPaymentByOrderId(orderId),
        enabled: isValidOrderId,
        retry: false,
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            if (!order) return;

            const pendingStoreOrders = order.storeOrders.filter(
                (storeOrder) => storeOrder.status === 'Pending'
            );

            await Promise.all(
                pendingStoreOrders.map((storeOrder) =>
                    cancelStoreOrder(storeOrder.storeOrderId)
                )
            );
        },

        onSuccess: async () => {
            toast.success('Order cancelled successfully.');
            await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            await queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        },

        onError: () => {
            toast.error('Unable to cancel this order.');
        },
    });

    function formatDate(value: string) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    }

    function handleCancelOrder() {
        const confirmed = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmed) return;

        cancelMutation.mutate();
    }

    if (!isValidOrderId) {
        return (
            <CenteredMessage
                title="Invalid order"
                message="The order ID in the URL is not valid."
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)]">
                <Loader2 className="h-10 w-10 animate-spin text-[#ff5f6d]" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <CenteredMessage
                title="We couldn't load this order."
                message="Please go back to your orders page and try again."
            />
        );
    }

    const allItems = order.storeOrders.flatMap((storeOrder) => storeOrder.items);

    const canCancelOrder =
        order.status === 'Pending' &&
        order.storeOrders.some((storeOrder) => storeOrder.status === 'Pending');

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4 py-10">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="mb-8"
                >
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff5f6d] transition hover:text-[#ff416c]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to orders
                    </Link>

                    <div className="mt-4 rounded-3xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#ffe1d6] bg-[#fff7f2] px-4 py-2 text-sm font-semibold text-[#ff5f6d]">
                                    <Package className="h-4 w-4" />
                                    Order #{String(order.orderId).padStart(6, '0')}
                                </div>

                                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                                    Order Details
                                </h1>

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-gray-300" />
                                        {formatDate(order.orderDate)}
                                    </span>

                                    <span>
                                        <AnimatedNumber
                                            key={`header-items-${order.orderId}-${allItems.length}`}
                                            value={allItems.length}
                                            delay={0.15}
                                        />{' '}
                                        {allItems.length === 1 ? 'item' : 'items'}
                                    </span>

                                    <span>
                                        <AnimatedNumber
                                            key={`header-stores-${order.orderId}-${order.storeOrders.length}`}
                                            value={order.storeOrders.length}
                                            delay={0.2}
                                        />{' '}
                                        {order.storeOrders.length === 1 ? 'store' : 'stores'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 lg:items-end">
                                <StatusBadge status={order.status} />

                                <AnimatedMoney
                                    key={`header-total-${order.orderId}-${order.totalAmount}`}
                                    value={order.totalAmount}
                                    delay={0.18}
                                    className="text-2xl font-bold text-gray-900"
                                />
                            </div>
                        </div>

                        <OrderProgress status={order.status} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                    <motion.section
                        variants={slideLeft}
                        initial="hidden"
                        animate="visible"
                        className="rounded-2xl border border-[#efe8f6] bg-white shadow-sm"
                    >
                        <div className="flex items-center gap-3 border-b border-[#f0edf7] px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#ff5f6d]">
                                <ShoppingBag className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Items Ordered
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Grouped by store
                                </p>
                            </div>
                        </div>

                        <motion.div
                            variants={storeCardVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-5 p-6"
                        >
                            {order.storeOrders.map((storeOrder, storeIndex) => (
                                <motion.div
                                    key={storeOrder.storeOrderId}
                                    variants={storeItemVariants}
                                    className="overflow-hidden rounded-2xl border border-[#f0edf7] bg-[#faf9fc]"
                                >
                                    <div className="flex flex-col justify-between gap-3 border-b border-[#f0edf7] bg-white px-5 py-4 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#ff5f6d]">
                                                <Store className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {storeOrder.storeName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Store order #{storeOrder.storeOrderId}
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={storeOrder.status} />
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left">
                                            <thead className="text-xs uppercase tracking-wide text-gray-400">
                                                <tr>
                                                    <th className="px-5 py-3 font-bold">
                                                        Product
                                                    </th>
                                                    <th className="px-5 py-3 font-bold">
                                                        Qty
                                                    </th>
                                                    <th className="px-5 py-3 font-bold">
                                                        Unit Price
                                                    </th>
                                                    <th className="px-5 py-3 text-right font-bold">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-[#f0edf7] bg-white">
                                                {storeOrder.items.map((item, itemIndex) => {
                                                    const baseDelay =
                                                        0.22 + storeIndex * 0.08 + itemIndex * 0.05;

                                                    return (
                                                        <tr key={item.storeOrderItemId}>
                                                            <td className="px-5 py-4">
                                                                <div className="font-semibold text-gray-900">
                                                                    {item.productName}
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-400">
                                                                    Product #{item.productId}
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                                                                <AnimatedNumber
                                                                    key={`qty-${item.storeOrderItemId}-${item.quantity}`}
                                                                    value={item.quantity}
                                                                    delay={baseDelay}
                                                                />
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                                <AnimatedMoney
                                                                    key={`unit-${item.storeOrderItemId}-${item.unitPrice}`}
                                                                    value={item.unitPrice}
                                                                    delay={baseDelay + 0.05}
                                                                    className="text-sm text-gray-600"
                                                                />
                                                            </td>

                                                            <td className="px-5 py-4 text-right">
                                                                <AnimatedMoney
                                                                    key={`line-${item.storeOrderItemId}-${item.lineTotal}`}
                                                                    value={item.lineTotal}
                                                                    delay={baseDelay + 0.1}
                                                                    className="font-bold text-gray-900"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[#f0edf7] bg-white px-5 py-4">
                                        <span className="text-sm font-semibold text-gray-500">
                                            Store subtotal
                                        </span>

                                        <AnimatedMoney
                                            key={`subtotal-${storeOrder.storeOrderId}-${storeOrder.subTotal}`}
                                            value={storeOrder.subTotal}
                                            delay={0.35 + storeIndex * 0.08}
                                            className="font-bold text-gray-900"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>

                    <motion.aside
                        variants={slideRight}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6 lg:sticky lg:top-8"
                    >
                        <motion.section
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#ff5f6d]">
                                    <CreditCard className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Payment
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Payment confirmation
                                    </p>
                                </div>
                            </div>

                            {isPaymentLoading ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading payment...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <InfoRow
                                        label="Status"
                                        value={
                                            <PaymentBadge
                                                status={payment?.status ?? order.paymentStatus}
                                            />
                                        }
                                    />

                                    <InfoRow
                                        label="Method"
                                        value={payment?.method ?? 'Not available'}
                                    />

                                    <InfoRow
                                        label="Amount"
                                        value={
                                            <AnimatedMoney
                                                key={`payment-amount-${order.orderId}-${payment?.amount ?? order.totalAmount}`}
                                                value={payment?.amount ?? order.totalAmount}
                                                delay={0.22}
                                                className="font-semibold text-gray-900"
                                            />
                                        }
                                    />

                                    <InfoRow
                                        label="Transaction ID"
                                        value={payment?.transactionId ?? 'Not available'}
                                    />

                                    <InfoRow
                                        label="Paid at"
                                        value={
                                            payment?.paidAt
                                                ? formatDate(payment.paidAt)
                                                : 'Not available'
                                        }
                                    />
                                </div>
                            )}
                        </motion.section>

                        <motion.section
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#ff5f6d]">
                                    <MapPin className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Shipping Address
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Delivery location
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <InfoRow label="Street" value={order.shippingLine1} />

                                {order.shippingLine2 && (
                                    <InfoRow
                                        label="Details"
                                        value={order.shippingLine2}
                                    />
                                )}

                                <InfoRow label="City" value={order.shippingCity} />

                                <InfoRow
                                    label="State / Region"
                                    value={order.shippingState}
                                />

                                <InfoRow
                                    label="Postal code"
                                    value={order.shippingPostalCode || 'Not provided'}
                                />

                                <InfoRow label="Country" value={order.shippingCountry} />
                            </div>
                        </motion.section>

                        <AnimatePresence>
                            {canCancelOrder && (
                                <motion.section
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                        transition: { duration: 0.2 },
                                    }}
                                    transition={{ delay: 0.3 }}
                                    className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="mb-4 flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                            <XCircle className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-gray-900">
                                                Cancel Order
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-500">
                                                This will cancel all pending store orders inside this order.
                                            </p>
                                        </div>
                                    </div>

                                    <motion.button
                                        type="button"
                                        onClick={handleCancelOrder}
                                        disabled={cancelMutation.isPending}
                                        whileHover={!cancelMutation.isPending ? { scale: 1.02 } : {}}
                                        whileTap={!cancelMutation.isPending ? { scale: 0.97 } : {}}
                                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {cancelMutation.isPending && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        {cancelMutation.isPending
                                            ? 'Cancelling...'
                                            : 'Cancel Order'}
                                    </motion.button>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

function CenteredMessage({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4">
            <div className="rounded-2xl border border-[#efe8f6] bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-gray-900">{title}</p>
                <p className="mt-2 text-sm text-gray-500">{message}</p>

                <Link
                    to="/orders"
                    className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-5 py-3 font-semibold text-white"
                >
                    Back to orders
                </Link>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        Shipped: 'bg-purple-100 text-purple-700 border-purple-200',
        Delivered: 'bg-green-100 text-green-700 border-green-200',
        Cancelled: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <motion.span
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
        >
            {status}
        </motion.span>
    );
}

function PaymentBadge({ status }: { status: string | null | undefined }) {
    const colors: Record<string, string> = {
        Paid: 'bg-green-100 text-green-700 border-green-200',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Failed: 'bg-red-100 text-red-700 border-red-200',
        Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const label = status ?? 'Not paid';
    const colorClass = status
        ? colors[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
        : 'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <motion.span
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
        >
            {label}
        </motion.span>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-[#f0edf7] pb-3 last:border-b-0 last:pb-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="max-w-[190px] break-words text-right text-sm font-semibold text-gray-900">
                {value}
            </span>
        </div>
    );
}

function OrderProgress({ status }: { status: string }) {
    const steps = [
        { label: 'Pending', icon: ReceiptText },
        { label: 'Confirmed', icon: CheckCircle2 },
        { label: 'Shipped', icon: Truck },
        { label: 'Delivered', icon: Package },
    ];

    if (status === 'Cancelled') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4"
            >
                <div className="flex items-center gap-3 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <p className="font-semibold">This order has been cancelled.</p>
                </div>
            </motion.div>
        );
    }

    const activeIndex = Math.max(
        0,
        steps.findIndex((step) => step.label === status)
    );

    const progressPercent = (activeIndex / (steps.length - 1)) * 100;

    return (
        <div className="mt-8">
            <div className="grid grid-cols-4 gap-3">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isDone = index <= activeIndex;

                    return (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.08,
                                duration: 0.3,
                                ease: 'easeOut' as const,
                            }}
                        >
                            <div
                                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition ${isDone
                                        ? 'border-[#ffccb9] bg-[#fff7f2] text-[#ff5f6d]'
                                        : 'border-[#f0edf7] bg-[#faf9fc] text-gray-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-bold">
                                    {step.label}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f0edf7]">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff416c]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut' as const,
                        delay: 0.3,
                    }}
                />
            </div>
        </div>
    );
}