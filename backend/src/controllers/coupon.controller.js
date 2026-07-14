import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new coupon
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            expirationDate,
            usageLimit,
            applicableProductIds,
        } = req.body;

        const existingCoupon = await prisma.coupon.findUnique({
            where: { code },
        });

        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }

        const newCoupon = await prisma.coupon.create({
            data: {
                code,
                discountType,
                discountValue,
                minPurchaseAmount,
                maxDiscountAmount,
                expirationDate: expirationDate ? new Date(expirationDate) : null,
                usageLimit,
                applicableProductIds: applicableProductIds || [],
            },
        });

        res.status(201).json({ success: true, data: newCoupon });
    } catch (error) {
        console.error("Create Coupon Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Validate a coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartAmount, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: "Coupon is inactive" });
        }

        if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
            return res.status(400).json({ success: false, message: "Coupon has expired" });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        if (coupon.minPurchaseAmount && cartAmount < coupon.minPurchaseAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of Rs. ${coupon.minPurchaseAmount} required`,
            });
        }

        let discountAmount = 0;

        // Product-specific discount logic
        if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
            // Logic: Calculate discount only on applicable items
            let applicableTotal = 0;

            // Filter items that match applicableProductIds
            const applicableItems = cartItems.filter(item =>
                coupon.applicableProductIds.includes(item.id) || coupon.applicableProductIds.includes(item.productId)
            );

            if (applicableItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon is not applicable to items in your cart"
                });
            }

            applicableTotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Now apply discount on applicableTotal
            if (coupon.discountType === "PERCENTAGE") {
                discountAmount = (applicableTotal * coupon.discountValue) / 100;
            } else {
                // Fixed discount - be careful if fixed discount > applicable total, usually cap at total
                discountAmount = Math.min(coupon.discountValue, applicableTotal);
            }

        } else {
            // Cart-wide discount
            if (coupon.discountType === "PERCENTAGE") {
                discountAmount = (cartAmount * coupon.discountValue) / 100;
            } else {
                discountAmount = coupon.discountValue;
            }
        }

        // Apply Max Discount Cap if exists
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }

        // Ensure discount doesn't exceed cart total
        discountAmount = Math.min(discountAmount, cartAmount);

        res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountAmount,
                message: "Coupon applied successfully",
            },
        });
    } catch (error) {
        console.error("Validate Coupon Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error("Get Coupons Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
