import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Footer } from '../components/Footer';
import {
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    Check,
    Loader2,
    Minus,
    Plus,
    ShoppingCart,
    Sparkles,
    Store,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { animate } from 'motion';
import {
    applyCoupon,
    fetchCart,
    removeCartItem,
    removeCoupon,
    updateCartItem,
} from '../api/cart';
import type { CartItem } from '../api/cart';
import { EmptyState } from '../components/ui/EmptyState';
/* ---------------------------------------------------------------------- */
/* Rolling text animation: best for quantity / percentages                 */
/* ---------------------------------------------------------------------- */
type AnimatedRollingTextProps = {
    value: number;
    formatter?: (value: number) => string;
    direction?: 1 | -1;
    className?: string;
};
function AnimatedRollingText({
    value,
    formatter = (nextValue) => String(nextValue),
    direction,
    className = '',
}: AnimatedRollingTextProps) {
    const previousValueRef = useRef(value);
    const [autoDirection, setAutoDirection] = useState<1 | -1>(1);
    useEffect(() => {
        if (value > previousValueRef.current) {
            setAutoDirection(1);
        }
        if (value < previousValueRef.current) {
            setAutoDirection(-1);
        }
        previousValueRef.current = value;
    }, [value]);
    const finalDirection = direction ?? autoDirection;
    const displayValue = formatter(value);
    return (
        <span className={`relative inline-flex overflow-hidden align-bottom ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={displayValue}
                    initial={{
                        y: finalDirection === -1 ? -12 : 12,
                        opacity: 0,
                        scale: 0.92,
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        y: finalDirection === -1 ? 12 : -12,
                        opacity: 0,
                        scale: 0.92,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: 'easeOut',
                    }}
                    className="inline-block"
                >
                    {displayValue}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
/* ---------------------------------------------------------------------- */
/* Fluid counter animation: best for prices / totals                       */
/* ---------------------------------------------------------------------- */
type AnimatedCounterTextProps = {
    value: number;
    formatter?: (value: number) => string;
    className?: string;
    duration?: number;
};
function AnimatedCounterText({
    value,
    formatter = (nextValue) => String(nextValue),
    className = '',
    duration = 0.45,
}: AnimatedCounterTextProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const currentValueRef = useRef(value);
    useEffect(() => {
        const controls = animate(currentValueRef.current, value, {
            duration,
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
    }, [value, duration]);
    return (
        <motion.span
            className={`inline-block tabular-nums ${className}`}
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            {formatter(displayValue)}
        </motion.span>
    );
}
/* ---------------------------------------------------------------------- */
/* Floating "+1 / -1" indicator that pops above the quantity box           */
/* whenever an item's quantity changes, regardless of the source.          */
/* ---------------------------------------------------------------------- */
function QuantityBumpIndicator({ quantity }: { quantity: number }) {
    const previousQuantityRef = useRef(quantity);
    const [bump, setBump] = useState<{ id: number; direction: 1 | -1 } | null>(null);
    useEffect(() => {
        if (quantity !== previousQuantityRef.current) {
            const direction: 1 | -1 = quantity > previousQuantityRef.current ? 1 : -1;
            previousQuantityRef.current = quantity;
            setBump({ id: Date.now(), direction });
            const timeout = setTimeout(() => setBump(null), 550);
            return () => clearTimeout(timeout);
        }
    }, [quantity]);
    return (
        <AnimatePresence>
            {bump && (
                <motion.span
                    key={bump.id}
                    initial={{ opacity: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 text-xs font-bold ${bump.direction === 1 ? 'text-green-500' : 'text-[#ff416c]'
                        }`}
                >
                    {bump.direction === 1 ? '+1' : '-1'}
                </motion.span>
            )}
        </AnimatePresence>
    );
}
/* ---------------------------------------------------------------------- */
/* Cart / Checkout / Payment stepper                                      */
/* ---------------------------------------------------------------------- */
function CartSteps() {
    const steps = ['Cart', 'Checkout', 'Payment'];
    const activeIndex = 0;
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
                                        ? 'scale-100 bg-[#ff5f6d] shadow-[0_0_0_4px_rgba(255,95,109,0.18)] animate-pulse'
                                        : isDone
                                            ? 'scale-100 bg-[#ff7a45]'
                                            : 'scale-75 bg-gray-300'
                                        }`}
                                />
                                <span
                                    className={`text-sm sm:text-lg font-semibold whitespace-nowrap transition-colors duration-500 ${isActive
                                        ? 'bg-gradient-to-r from-[#ff7a45] to-[#ff416c] bg-clip-text text-transparent'
                                        : 'text-gray-400'
                                        }`}
                                >
                                    {step}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="relative h-px w-6 sm:w-20 shrink-0 overflow-hidden border-t-2 border-dashed border-[#d7d1e8]">
                                    <div
                                        className={`absolute inset-y-0 left-0 border-t-2 border-dashed border-[#ff7a45] transition-all duration-700 ease-out ${i < activeIndex ? 'w-full' : 'w-0'
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
function fireCouponConfetti() {
    const defaults = {
        startVelocity: 22,
        spread: 70,
        ticks: 100,
        zIndex: 99999,
    };
    confetti({
        ...defaults,
        particleCount: 60,
        angle: 60,
        origin: { x: 0, y: 0.1 },
        colors: ['#ff7a45', '#ff416c', '#9b5cff'],
    });
    confetti({
        ...defaults,
        particleCount: 60,
        angle: 120,
        origin: { x: 1, y: 0.1 },
        colors: ['#ff7a45', '#ff416c', '#9b5cff'],
    });
    confetti({
        ...defaults,
        particleCount: 80,
        spread: 100,
        angle: 90,
        startVelocity: 28,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#ff7a45', '#ff416c', '#9b5cff'],
    });
}
/* ---------------------------------------------------------------------- */
/* Mini cart icon hover animation                                         */
/* ---------------------------------------------------------------------- */
function AnimatedCartIcon() {
    return (
        <div className="group relative mb-1 flex h-11 w-11 cursor-pointer items-center justify-center overflow-visible rounded-full bg-white text-[#ff5f6d] shadow-sm ring-1 ring-[#ffd6cc] transition duration-300 ease-out hover:scale-105 hover:shadow-[0_12px_25px_rgba(255,95,109,0.18)]">
            <span
                className="pointer-events-none absolute left-[21px] top-[-18px] h-1.5 w-2 rounded-[1.5px] bg-[#ff7a45] opacity-0
               transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
               group-hover:top-[11px] group-hover:rotate-3 group-hover:opacity-100"
            />
            <span
                className="pointer-events-none absolute left-[21px] top-[-18px] h-2 w-2 rounded-[1.5px] bg-[#9b5cff] opacity-0
               transition-all delay-100 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
               group-hover:top-[17px] group-hover:-rotate-6 group-hover:opacity-100"
            />
            <span
                className="pointer-events-none absolute left-[21px] top-[-18px] h-1.5 w-2 rounded-[1.5px] bg-[#ff416c] opacity-0
               transition-all delay-200 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
               group-hover:top-[5px] group-hover:-rotate-3 group-hover:opacity-100"
            />
            <span
                className="pointer-events-none absolute inset-0 rounded-full bg-[#ff7a45]/0
                           transition-all delay-300 duration-300 ease-out
                           group-hover:bg-[#ff7a45]/10 group-hover:scale-110"
            />
            <ShoppingCart className="h-5 w-5 transition duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110" />
        </div>
    );
}
/* ---------------------------------------------------------------------- */
/* Header cart icon + item-count badge that bumps whenever the count       */
/* changes (add, remove, quantity edit).                                   */
/* ---------------------------------------------------------------------- */
function CartHeaderIcon({ itemCount }: { itemCount: number }) {
    const previousCountRef = useRef(itemCount);
    const [bumpKey, setBumpKey] = useState(0);
    useEffect(() => {
        if (itemCount !== previousCountRef.current) {
            previousCountRef.current = itemCount;
            setBumpKey((k) => k + 1);
        }
    }, [itemCount]);
    return (
        <div className="relative">
            <AnimatedCartIcon />
            <AnimatePresence>
                {itemCount > 0 && (
                    <motion.div
                        key="badge"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-1 text-[11px] font-bold text-white shadow-[0_4px_10px_rgba(255,65,108,0.35)]"
                    >
                        <motion.span
                            key={bumpKey}
                            initial={{ scale: 1.6 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                            <AnimatedRollingText value={itemCount} />
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
/* ---------------------------------------------------------------------- */
/* Variants for the cart item list (stagger in, slide out on removal)      */
/* ---------------------------------------------------------------------- */
const cartItemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] },
    }),
    exit: {
        opacity: 0,
        x: -24,
        scale: 0.97,
        transition: { duration: 0.25, ease: 'easeIn' },
    },
};
const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};
export function CartPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [couponInput, setCouponInput] = useState('');
    const [pendingProductId, setPendingProductId] = useState<number | null>(null);
    const [quantityDirection, setQuantityDirection] = useState<Record<number, 1 | -1>>({});
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
    const updateQuantityMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
            updateCartItem(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: () => {
            toast.error('Failed to update quantity.');
        },
        onSettled: () => {
            setPendingProductId(null);
        },
    });
    const removeItemMutation = useMutation({
        mutationFn: (productId: number) => removeCartItem(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Item removed.');
        },
        onError: () => {
            toast.error('Failed to remove item.');
        },
        onSettled: () => {
            setPendingProductId(null);
        },
    });
    const applyCouponMutation = useMutation({
        mutationFn: (code: string) => applyCoupon(code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Coupon applied.');
            setCouponInput('');
            fireCouponConfetti();
        },
        onError: () => {
            toast.error('Invalid or expired coupon.');
        },
    });
    const removeCouponMutation = useMutation({
        mutationFn: removeCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Coupon removed.');
        },
        onError: () => {
            toast.error('Failed to remove coupon.');
        },
    });
    function formatMoney(value: number) {
        return `$${Number(value || 0).toFixed(2)}`;
    }
    function formatPercentage(value: number) {
        return `-${Number(value || 0).toFixed(0)}%`;
    }
    function handleQuantityChange(productId: number, currentQuantity: number, nextQuantity: number) {
        if (Number.isNaN(nextQuantity)) return;
        setPendingProductId(productId);
        if (nextQuantity <= 0) {
            removeItemMutation.mutate(productId);
            return;
        }
        if (nextQuantity === currentQuantity) {
            setPendingProductId(null);
            return;
        }
        updateQuantityMutation.mutate({
            productId,
            quantity: nextQuantity,
        });
    }
    function handleMinus(productId: number, currentQuantity: number) {
        setQuantityDirection((prev) => ({
            ...prev,
            [productId]: -1,
        }));
        handleQuantityChange(productId, currentQuantity, currentQuantity - 1);
    }
    function handlePlus(productId: number, currentQuantity: number) {
        setQuantityDirection((prev) => ({
            ...prev,
            [productId]: 1,
        }));
        handleQuantityChange(productId, currentQuantity, currentQuantity + 1);
    }
    function handleApplyCoupon() {
        const code = couponInput.trim();
        if (!code) {
            toast.error('Please enter a coupon code.');
            return;
        }
        applyCouponMutation.mutate(code);
    }
    const isEmpty = !cart || cart.items.length === 0;
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)]">
                <div className="px-4 py-10">
                    <div className="mx-auto max-w-7xl animate-pulse">
                        <div className="mb-10 flex justify-center">
                            <div className="h-6 w-64 rounded-full bg-gray-200" />
                        </div>
                        <div className="mb-8 h-10 w-48 rounded-lg bg-gray-200" />
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="space-y-6 rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-5 border-b border-[#f0edf7] pb-6 last:border-0 last:pb-0"
                                    >
                                        <div className="h-24 w-24 shrink-0 rounded-xl bg-gray-200" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 w-2/3 rounded bg-gray-200" />
                                            <div className="h-3 w-1/3 rounded bg-gray-200" />
                                            <div className="h-3 w-1/4 rounded bg-gray-200" />
                                        </div>
                                        <div className="h-9 w-24 shrink-0 rounded-lg bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="h-32 rounded-2xl bg-gray-200" />
                                <div className="h-64 rounded-2xl bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-[#efe8f6]">
                    <p className="text-lg font-semibold text-gray-900">Failed to load cart.</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Please refresh the page and try again.
                    </p>
                </div>
            </div>
        );
    }
    if (isEmpty) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <EmptyState
                        icon={ShoppingCart}
                        title="Your cart is empty"
                        description="Looks like you have not added any products to your cart yet."
                        ctaLabel="Shop Now"
                        ctaTo="/products"
                    />
                </div>
            </div>
        );
    }
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] px-4">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-[#efe8f6]">
                    <p className="text-lg font-semibold text-gray-900">Failed to load cart.</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Please refresh the page and try again.
                    </p>
                </div>
            </div>
        );
    }
    if (isEmpty) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)] flex items-center justify-center px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
                    }}
                    className="max-w-md text-center bg-white rounded-3xl shadow-sm border border-[#efe8f6] p-10"
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, scale: 0.85 },
                            visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className="mb-6 flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex h-28 w-28 items-center justify-center rounded-full bg-[#fff1ea]"
                        >
                            <ShoppingCart className="h-14 w-14 text-[#ff5f6d]" strokeWidth={1.5} />
                        </motion.div>
                    </motion.div>
                    <motion.h1
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        className="text-2xl font-bold text-gray-900"
                    >
                        Your cart is empty
                    </motion.h1>
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                        className="mt-3 text-gray-500"
                    >
                        Looks like you have not added any products to your cart yet.
                    </motion.p>
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                        <Link
                            to="/products"
                            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-6 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300 ease-out hover:scale-[1.01]"
                        >
                            Shop Now
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }
    const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6fb_0%,#fff7f2_100%)]">
            <div className="px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <CartSteps />
                    <div className="mb-8">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Link to="/" className="transition hover:text-[#ff5f6d]">
                                Home
                            </Link>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-[#ff5f6d]">Shopping Cart</span>
                        </div>
                        <div className="flex items-end justify-between gap-4 border-b border-[#d7d1e8] pb-2">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
                            </div>
                            <CartHeaderIcon itemCount={totalItemCount} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                            className="rounded-2xl border border-[#efe8f6] bg-white shadow-sm"
                        >
                            <div className="grid grid-cols-1 border-b border-[#f0edf7] px-6 py-4 md:grid-cols-[minmax(0,1fr)_148px_120px_80px] md:items-center">
                                <h2 className="font-bold text-gray-900">
                                    Products (
                                    <AnimatedRollingText
                                        value={cart.items.length}
                                        className="font-bold text-gray-900"
                                    />
                                    )
                                </h2>
                                <span className="hidden text-left pl-3 text-sm font-semibold uppercase tracking-wide text-gray-400 md:block">
                                    QTY
                                </span>
                                <span className="hidden pr-6 text-right text-sm font-semibold uppercase tracking-wide text-gray-400 md:block">
                                    Price
                                </span>
                                <span className="hidden md:block" />
                            </div>
                            {storeGroups.map((group) => (
                                <div key={group.storeId}>
                                    <div className="flex items-center gap-2 border-b border-[#f0edf7] bg-[#faf9fc] px-6 py-3">
                                        <Store className="h-4 w-4 text-[#ff5f6d]" />
                                        <span className="text-sm font-bold text-gray-700">{group.storeName}</span>
                                        <span className="text-xs text-gray-400">
                                            ({group.items.length} {group.items.length === 1 ? 'item' : 'items'})
                                        </span>
                                    </div>
                                    <div className="divide-y divide-[#f0edf7]">
                                        <AnimatePresence initial={false} mode="popLayout">
                                            {group.items.map((item, index) => {
                                                const isPending = pendingProductId === item.productId;
                                                const itemDirection = quantityDirection[item.productId];
                                                return (
                                                    <motion.div
                                                        key={item.productId}
                                                        layout
                                                        custom={index}
                                                        variants={cartItemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-[minmax(0,1fr)_148px_120px_80px] md:items-center"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-5">
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#f0edf7] bg-[#faf9fc]"
                                                            >
                                                                {item.imageUrl ? (
                                                                    <img
                                                                        src={item.imageUrl}
                                                                        alt={item.productName}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <ShoppingCart className="h-9 w-9 text-gray-300" />
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                            <div className="min-w-0">
                                                                <h3 className="truncate font-bold text-gray-900">
                                                                    {item.productName}
                                                                </h3>
                                                                {item.sku && (
                                                                    <p className="mt-1 truncate text-sm text-gray-400">
                                                                        SKU: {item.sku}
                                                                    </p>
                                                                )}
                                                                <p className="mt-2 text-sm text-gray-600">
                                                                    Unit price:{' '}
                                                                    <AnimatedCounterText
                                                                        value={item.unitPrice}
                                                                        formatter={formatMoney}
                                                                        className="font-semibold text-gray-900"
                                                                    />
                                                                </p>
                                                                {item.quantityInStock <= 0 ? (
                                                                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        Out of stock
                                                                    </p>
                                                                ) : item.quantity > item.quantityInStock ? (
                                                                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        Only {item.quantityInStock} left in stock
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                        <div className="flex w-full items-center justify-start gap-2 md:w-[148px] md:justify-start">
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMinus(item.productId, item.quantity)
                                                                }
                                                                disabled={isPending}
                                                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e7e1f2] text-gray-600 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#ffb199] hover:bg-[#fff7f2] hover:text-[#ff5f6d] hover:shadow-[0_8px_18px_rgba(255,95,109,0.14)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </motion.button>
                                                            <div className="relative flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e7e1f2] bg-white text-sm font-semibold text-gray-900">
                                                                <QuantityBumpIndicator quantity={item.quantity} />
                                                                <AnimatedRollingText
                                                                    value={item.quantity}
                                                                    direction={itemDirection}
                                                                    className="font-semibold text-gray-900"
                                                                />
                                                            </div>
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                onClick={() =>
                                                                    handlePlus(item.productId, item.quantity)
                                                                }
                                                                disabled={isPending}
                                                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e7e1f2] text-gray-600 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#ffb199] hover:bg-[#fff7f2] hover:text-[#ff5f6d] hover:shadow-[0_8px_18px_rgba(255,95,109,0.14)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </motion.button>
                                                            {isPending && (
                                                                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#ff5f6d]" />
                                                            )}
                                                        </div>
                                                        <div className="md:text-right">
                                                            <p className="text-sm text-gray-400">Line total</p>
                                                            <AnimatedCounterText
                                                                value={item.lineTotal}
                                                                formatter={formatMoney}
                                                                className="font-bold text-gray-900"
                                                            />
                                                        </div>
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            type="button"
                                                            onClick={() => {
                                                                setPendingProductId(item.productId);
                                                                removeItemMutation.mutate(item.productId);
                                                            }}
                                                            disabled={isPending}
                                                            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#f0dce2] text-gray-400 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#ffb3c1] hover:bg-[#fff1f4] hover:text-[#ff416c] hover:shadow-[0_10px_22px_rgba(255,65,108,0.14)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
                                                            aria-label="Remove item"
                                                            title="Remove item"
                                                        >
                                                            {isPending && removeItemMutation.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </motion.button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                            className="space-y-4 self-start lg:sticky lg:top-8"
                        >
                            <div className="rounded-2xl border border-[#efe8f6] bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-[#ff5f6d]" />
                                    <h2 className="font-semibold text-gray-900">Coupon</h2>
                                </div>
                                {cart.couponCode ? (
                                    <div className="animate-[fadeInScale_0.4s_ease-out] space-y-3">
                                        <div className="relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.35)]">
                                                    <Check className="h-5 w-5" strokeWidth={2.5} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-green-700">
                                                        Coupon applied
                                                    </p>
                                                    <p className="truncate text-sm text-green-600">
                                                        Code:{' '}
                                                        <span className="font-mono font-semibold">
                                                            {cart.couponCode}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="shrink-0 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
                                                    <AnimatedRollingText
                                                        value={cart.discountPercentage}
                                                        formatter={formatPercentage}
                                                        className="font-bold text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 border-t border-green-200/60 pt-3 text-sm text-green-700">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                        You saved{' '}
                                                        <AnimatedCounterText
                                                            value={cart.discountAmount}
                                                            formatter={formatMoney}
                                                            className="font-bold text-green-700"
                                                        />{' '}
                                                        on this order
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-green-100">
                                                    <motion.div
                                                        key={cart.couponCode}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, cart.discountPercentage)}%` }}
                                                        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                                                        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                    >
                                                        <motion.div
                                                            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                                            animate={{ x: ['-100%', '250%'] }}
                                                            transition={{
                                                                duration: 2.4,
                                                                repeat: Infinity,
                                                                repeatDelay: 0.9,
                                                                ease: 'easeInOut',
                                                            }}
                                                        />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.96 }}
                                            type="button"
                                            onClick={() => removeCouponMutation.mutate()}
                                            disabled={removeCouponMutation.isPending}
                                            className="inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium text-gray-500 transition duration-300 ease-out hover:text-[#ff416c] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {removeCouponMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                            Remove coupon
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleApplyCoupon();
                                            }}
                                            placeholder="Enter coupon code"
                                            className="w-full rounded-xl border border-[#e7e1f2] px-4 py-3 text-sm outline-none focus:border-[#ff7a45] focus:ring-2 focus:ring-[#ffe1d6]"
                                        />
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={
                                                applyCouponMutation.isPending || !couponInput.trim()
                                            }
                                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(255,95,109,0.22)] transition duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_18px_35px_rgba(255,95,109,0.28)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {applyCouponMutation.isPending && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            Apply
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                            <aside className="rounded-2xl border border-[#efe8f6] bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <AnimatedCounterText
                                            value={cart.subtotal}
                                            formatter={formatMoney}
                                            className="font-medium text-gray-900"
                                        />
                                    </div>
                                    {cart.couponCode && cart.discountAmount > 0 && (
                                        <div className="flex items-center justify-between text-green-600">
                                            <span>Discount</span>
                                            <AnimatedCounterText
                                                value={cart.discountAmount}
                                                formatter={(value) => `-${formatMoney(value)}`}
                                                className="font-semibold text-green-600"
                                            />
                                        </div>
                                    )}
                                    <div className="border-t border-[#f0edf7] pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">
                                                Total
                                            </span>
                                            <AnimatedCounterText
                                                value={cart.finalTotal}
                                                formatter={formatMoney}
                                                className="text-lg font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => navigate('/checkout')}
                                    disabled={isEmpty}
                                    className="mt-6 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#ff7a45] to-[#ff416c] py-3 font-semibold text-white shadow-[0_16px_35px_rgba(255,95,109,0.28)] transition duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_20px_42px_rgba(255,95,109,0.34)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Proceed to Checkout
                                </motion.button>
                                <div className="mt-4">
                                    <Link
                                        to="/products"
                                        className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-gray-500 transition duration-300 ease-out hover:text-[#ff5f6d]"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Continue shopping
                                    </Link>
                                    <div className="mt-6 border-t border-[#f0edf7] pt-5">
                                        <p className="mb-3 text-center text-sm font-semibold tracking-wide text-gray-500">
                                            We accept
                                        </p>
                                        <div className="flex justify-center">
                                            <div className="flex items-center gap-2 rounded-full border border-[#f0edf7] bg-[#faf9fc] px-4 py-2 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(255,95,109,0.10)]">
                                                <img
                                                    src="/payment-methods/wish-money.png"
                                                    alt="Wish Money"
                                                    className="h-6 w-auto object-contain"
                                                />
                                                <span className="h-3 w-px bg-[#e7e1f2]" />
                                                <span className="text-[11px] font-medium text-gray-400">
                                                    Secure payment
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}