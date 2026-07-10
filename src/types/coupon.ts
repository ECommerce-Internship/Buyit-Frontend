// Mirrors backend CouponDiscountType. ASP.NET serializes enums as their underlying int
// by default (0 = Percentage, 1 = FixedAmount) — confirmed via the live API response.
export type CouponDiscountType = 0 | 1;
export const DISCOUNT_TYPE_LABEL: Record<CouponDiscountType, string> = {
    0: 'Percentage',
    1: 'Fixed amount',
};

export interface CouponResponse {
    id: number;
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    expiryDate: string;       // ISO date string
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
    storeId: number | null;   // null = platform-wide coupon
    storeName: string | null;
}

// Mirrors backend CreateCouponRequest.
export interface CreateCouponBody {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    expiryDate: string;
    usageLimit?: number | null;
    storeId?: number | null;  // null/omitted = platform-wide (Admin only)
}

// Mirrors backend UpdateCouponRequest. No storeId — ownership can't be transferred.
export interface UpdateCouponBody {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    expiryDate: string;
    isActive: boolean;
    usageLimit?: number | null;
}