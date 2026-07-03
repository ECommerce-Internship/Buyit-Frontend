import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { animate, motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    PackageCheck,
    ReceiptText,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';

import { fetchMyOrders } from '../api/orders';

const PAGE_SIZE = 10;

/* ---------------------------------------------------------------------- */
/* Animation variants                                                      */
/* ---------------------------------------------------------------------- */

const tableVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.07,
        },
    },
};

const rowVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' as const },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.2, ease: 'easeIn' as const },
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
/* Animated money counter                                                  */
/* ---------------------------------------------------------------------- */

function AnimatedMoney({
    value,
    delay = 0,
}: {
    value: number;
    delay?: number;
}) {
    const [displayValue, setDisplayValue] = useState(0);
    const currentValueRef = useRef(0);

    useEffect(() => {
        currentValueRef.current = 0;

        const controls = animate(0, value, {
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
            className="inline-block tabular-nums font-bold text-gray-900"
            initial={{ scale: 0.96, opacity: 0.75 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay }}
        >
            ${displayValue.toFixed(2)}
        </motion.span>
    );
}

/* ---------------------------------------------------------------------- */
/* MyOrdersPage                                                            */
/* ---------------------------------------------------------------------- */

export function MyOrdersPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['my-orders', page, PAGE_SIZE],
        queryFn: () => fetchMyOrders(page, PAGE_SIZE),
        refetchOnWindowFocus: true,
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)]">
                <Loader2 className="h-10 w-10 animate-spin text-[#ff5f6d]" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4">
                <div className="rounded-2xl border border-[#efe8f6] bg-white p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-gray-900">
                        Failed to load your orders.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Please refresh the page and try again.
                    </p>
                </div>
            </div>
        );
    }

    if (!data || data.items.length === 0) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4 py-10">
                <div className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="rounded-3xl border border-[#efe8f6] bg-white p-10 text-center shadow-sm"
                    >
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ea] text-[#ff5f6d]">
                            <ShoppingCart className="h-9 w-9" />
                        </div>

                        <h1 className="mt-6 text-3xl font-bold text-gray-900">
                            You have no orders yet
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-gray-500">
                            Once you place an order, it will appear here with its status,
                            payment information, and details.
                        </p>

                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-8 inline-block"
                        >
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300"
                            >
                                Shop Now
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4 py-10">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="mb-8 flex flex-col justify-between gap-4 border-b border-[#d7d1e8] pb-5 md:flex-row md:items-end"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffe1d6] bg-white px-4 py-2 text-sm font-semibold text-[#ff5f6d] shadow-sm">
                            <PackageCheck className="h-4 w-4" />
                            Order history
                        </div>

                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Track your purchases, payment status, and order details.
                        </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center rounded-xl border border-[#e7e1f2] bg-white px-5 py-3 font-semibold text-gray-600 shadow-sm transition hover:border-[#ffccb9] hover:bg-[#fff7f2] hover:text-[#ff5f6d]"
                        >
                            Continue Shopping
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                    className="overflow-hidden rounded-2xl border border-[#efe8f6] bg-white shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-[#f0edf7] px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1ea] text-[#ff5f6d]">
                                <ReceiptText className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Recent Orders
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {data.totalCount} total{' '}
                                    {data.totalCount === 1 ? 'order' : 'orders'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-[#faf9fc] text-xs uppercase tracking-wide text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Order</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Payment</th>
                                    <th className="px-6 py-4 font-bold">Items</th>
                                    <th className="px-6 py-4 font-bold">Total</th>
                                    <th className="px-6 py-4 text-right font-bold">Action</th>
                                </tr>
                            </thead>

                            <AnimatePresence mode="wait">
                                <motion.tbody
                                    key={page}
                                    variants={tableVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="divide-y divide-[#f0edf7]"
                                >
                                    {data.items.map((order, index) => (
                                        <motion.tr
                                            key={order.orderId}
                                            variants={rowVariants}
                                            className="transition hover:bg-[#fffaf7]"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-900">
                                                    #{String(order.orderId).padStart(6, '0')}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-400">
                                                    {order.storeOrderCount}{' '}
                                                    {order.storeOrderCount === 1
                                                        ? 'store'
                                                        : 'stores'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 text-gray-300" />
                                                    {formatDate(order.orderDate)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge status={order.status} />
                                            </td>

                                            <td className="px-6 py-5">
                                                <PaymentBadge status={order.paymentStatus} />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                    <ShoppingBag className="h-4 w-4 text-gray-300" />
                                                    {order.itemCount}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <AnimatedMoney
                                                    key={`${page}-${order.orderId}-${order.totalAmount}`}
                                                    value={order.totalAmount}
                                                    delay={0.16 + index * 0.06}
                                                />
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-block"
                                                >
                                                    <Link
                                                        to={`/orders/${order.orderId}`}
                                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,95,109,0.22)] transition"
                                                    >
                                                        View
                                                    </Link>
                                                </motion.div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </AnimatePresence>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-[#f0edf7] px-6 py-5 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Page{' '}
                            <span className="font-semibold text-gray-900">
                                {data.page}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-gray-900">
                                {data.totalPages}
                            </span>
                        </p>

                        <div className="flex items-center gap-3">
                            <motion.button
                                type="button"
                                disabled={!data.hasPrevious}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                whileHover={data.hasPrevious ? { scale: 1.03 } : {}}
                                whileTap={data.hasPrevious ? { scale: 0.97 } : {}}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e7e1f2] bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#ffccb9] hover:bg-[#fff7f2] hover:text-[#ff5f6d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </motion.button>

                            <motion.button
                                type="button"
                                disabled={!data.hasNext}
                                onClick={() => setPage((prev) => prev + 1)}
                                whileHover={data.hasNext ? { scale: 1.03 } : {}}
                                whileTap={data.hasNext ? { scale: 0.97 } : {}}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e7e1f2] bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#ffccb9] hover:bg-[#fff7f2] hover:text-[#ff5f6d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------- */
/* Status badge with pop animation                                         */
/* ---------------------------------------------------------------------- */

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

/* ---------------------------------------------------------------------- */
/* Payment badge with pop animation                                        */
/* ---------------------------------------------------------------------- */

function PaymentBadge({ status }: { status: string | null }) {
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