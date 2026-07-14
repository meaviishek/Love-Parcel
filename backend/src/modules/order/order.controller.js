import prisma from "../../lib/prisma.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


export const createOrder = async (req, res) => {
    try {
        const { addressId, addressData, paymentMode, customHamperId } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        // Address Handling
        let finalAddressId = addressId;

        if (!finalAddressId && addressData) {
            // Create new address
            const newAddress = await prisma.address.create({
                data: {
                    userId,
                    fullName: addressData.fullName,
                    phone: addressData.phone,
                    house: addressData.house,
                    area: addressData.area,
                    landmark: addressData.landmark,
                    city: addressData.city,
                    state: addressData.state,
                    pincode: addressData.pincode
                }
            });
            finalAddressId = newAddress.id;
        }

        if (!finalAddressId) {
            return res.status(400).json({ status: "fail", message: "Address is required" });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        if (customHamperId) {
            // Direct Order Logic
            const hamper = await prisma.customHamper.findUnique({ where: { id: customHamperId } });
            if (!hamper) return res.status(404).json({ status: "fail", message: "Hamper not found" });

            totalAmount = hamper.totalPrice;
            orderItemsData.push({
                hamperId: hamper.id,
                quantity: 1,
                price: hamper.totalPrice
            });
        } else {
            // Cart Logic
            const cart = await prisma.cart.findFirst({
                where: { userId },
                include: { items: true }
            });

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ status: "fail", message: "Cart is empty" });
            }

            // Optimize: Fetch all products/hampers in one go
            const productIds = cart.items.filter(i => i.productId).map(i => i.productId);
            const hamperIds = cart.items.filter(i => i.hamperId).map(i => i.hamperId);
            const customHamperIds = cart.items.filter(i => i.customHamperId).map(i => i.customHamperId);

            const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
            const hampers = await prisma.customHamper.findMany({ where: { id: { in: [...hamperIds, ...customHamperIds] } } });

            for (const item of cart.items) {
                let price = 0;
                if (item.productId) {
                    const product = products.find(p => p.id === item.productId);
                    if (product) price = product.price;
                } else if (item.hamperId || item.customHamperId) {
                    const hId = item.hamperId || item.customHamperId;
                    const hamper = hampers.find(h => h.id === hId);
                    if (hamper) price = hamper.totalPrice;
                }

                totalAmount += price * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    hamperId: item.hamperId,
                    customHamperId: item.customHamperId,
                    quantity: item.quantity,
                    price: price,
                    customizationNote: item.customizationNote,
                    customizationImages: item.customizationImages
                });
            }
        }

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                userId,
                addressId: finalAddressId,
                totalAmount,
                paymentMode: paymentMode || "COD", // Default to COD
                paymentStatus: "PENDING",
                orderStatus: "PLACED",
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // 4. Clear Cart ONLY if not a direct order
        if (!customHamperId) {
            // Re-fetch cart ID if needed or we have it? we have 'cart' in scope only in else block
            // Need to fetch cart ID if we are here? No, 'cart' variable is scoped to else block.
            // We can just findFirst again or move cart fetch up?
            // Actually, simplest is to just fetch cart again to delete or structure code better.
            // But let's look at logic: if we are in !customHamperId block, 'cart' exists.
            // Refactoring scopes:
            const cart = await prisma.cart.findFirst({ where: { userId } });
            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: { cartId: cart.id }
                });
            }
        }

        res.status(201).json({
            status: "success",
            data: order,
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!order) return res.status(404).json({ status: "fail", message: "Order not found" });

        res.status(200).json({ status: "success", data: order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || req.body.userId;
        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        // 1. Fetch Orders (Basic Include only)
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Collect IDs
        const productIds = new Set();
        const customHamperIds = new Set();

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId) productIds.add(item.productId);
                if (item.customHamperId) customHamperIds.add(item.customHamperId);
            });
        });

        // 3. Fetch Custom Hampers (Manually)
        let customHampersMap = {};
        const boxIds = new Set();

        if (customHamperIds.size > 0) {
            const hampers = await prisma.customHamper.findMany({
                where: { id: { in: Array.from(customHamperIds) } },
                include: { items: true } // Removed broken box include
            });

            hampers.forEach(h => {
                customHampersMap[h.id] = h;
                if (h.boxId) boxIds.add(h.boxId);
                // Collect product IDs from hamper items
                if (h.items) {
                    h.items.forEach(hi => {
                        if (hi.productId) productIds.add(hi.productId);
                    });
                }
            });
        }

        // 4. Fetch Boxes
        let boxesMap = {};
        if (boxIds.size > 0) {
            const boxes = await prisma.hamperBox.findMany({
                where: { id: { in: Array.from(boxIds) } }
            });
            boxes.forEach(b => boxesMap[b.id] = b);
        }

        // 5. Fetch Products
        const products = await prisma.product.findMany({
            where: {
                id: { in: Array.from(productIds) }
            },
            select: { id: true, name: true, price: true, images: true }
        });

        // 6. Enrich Data
        const enrichedOrders = orders.map(order => {
            const enrichedItems = order.items.map(item => {
                let itemDetails = null;

                // Enrich Regular Product
                if (item.productId) {
                    const p = products.find(p => p.id === item.productId);
                    if (p) itemDetails = { name: p.name, image: p.images[0] };
                }

                // Enrich Custom Hamper
                let enrichedHamper = null;
                if (item.customHamperId && customHampersMap[item.customHamperId]) {
                    const rawHamper = customHampersMap[item.customHamperId];

                    const enrichedHamperItems = rawHamper.items.map(hItem => {
                        const p = products.find(p => p.id === hItem.productId);
                        return {
                            ...hItem,
                            product: p ? { name: p.name, image: p.images[0], price: p.price } : { name: "Unknown Product" }
                        };
                    });

                    const box = rawHamper.boxId ? boxesMap[rawHamper.boxId] : null;

                    enrichedHamper = {
                        ...rawHamper,
                        items: enrichedHamperItems,
                        box: box // Manually attached
                    };
                }

                return {
                    ...item,
                    details: itemDetails,
                    customHamper: enrichedHamper
                };
            });
            return { ...order, items: enrichedItems };
        });

        res.status(200).json({ status: "success", data: enrichedOrders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const initiatePayment = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { customHamperId } = req.body;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        let totalAmount = 0;
        let cartId = null;

        if (customHamperId) {
            const hamper = await prisma.customHamper.findUnique({ where: { id: customHamperId } });
            if (!hamper) return res.status(404).json({ status: "fail", message: "Hamper not found" });
            totalAmount = hamper.totalPrice;
        } else {
            // 1. Get user's cart
            const cart = await prisma.cart.findFirst({
                where: { userId },
                include: { items: true }
            });

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ status: "fail", message: "Cart is empty" });
            }
            cartId = cart.id;

            // 2. Calculate Total
            const productIds = cart.items.filter(i => i.productId).map(i => i.productId);
            const hamperIds = cart.items.filter(i => i.hamperId).map(i => i.hamperId);
            const customHamperIds = cart.items.filter(i => i.customHamperId).map(i => i.customHamperId);

            const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
            const hampers = await prisma.customHamper.findMany({ where: { id: { in: [...hamperIds, ...customHamperIds] } } });

            for (const item of cart.items) {
                let price = 0;
                if (item.productId) {
                    const product = products.find(p => p.id === item.productId);
                    if (product) price = product.price;
                } else if (item.hamperId || item.customHamperId) {
                    const hId = item.hamperId || item.customHamperId;
                    const hamper = hampers.find(h => h.id === hId);
                    if (hamper) price = hamper.totalPrice;
                }
                totalAmount += price * item.quantity;
            }
        }

        // 3. Create Razorpay Order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            status: "success",
            data: {
                id: order.id,
                currency: order.currency,
                amount: order.amount,
                cartId: cartId,
                customHamperId: customHamperId // Pass back to frontend to pass to verify
            }
        });

    } catch (error) {
        console.error("Error initiating payment:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId, addressData, customHamperId } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        // Address Handling
        let finalAddressId = addressId;

        if (!finalAddressId && addressData) {
            // Create new address
            const newAddress = await prisma.address.create({
                data: {
                    userId,
                    fullName: addressData.fullName,
                    phone: addressData.phone,
                    house: addressData.house,
                    area: addressData.area,
                    landmark: addressData.landmark,
                    city: addressData.city,
                    state: addressData.state,
                    pincode: addressData.pincode
                }
            });
            finalAddressId = newAddress.id;
        }

        if (!finalAddressId) {
            return res.status(400).json({ status: "fail", message: "Address is required" });
        }

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ status: "fail", message: "Invalid signature" });
        }

        // 2. Payment Verified -> Create Order
        let totalAmount = 0;
        const orderItemsData = [];

        if (customHamperId) {
            const hamper = await prisma.customHamper.findUnique({ where: { id: customHamperId } });
            if (!hamper) return res.status(404).json({ status: "fail", message: "Hamper not found" }); // Should rare if paid

            totalAmount = hamper.totalPrice;
            orderItemsData.push({
                hamperId: hamper.id,
                customHamperId: hamper.id,
                quantity: 1,
                price: hamper.totalPrice
            });

        } else {
            const cart = await prisma.cart.findFirst({
                where: { userId },
                include: { items: true }
            });

            if (!cart) return res.status(400).json({ status: "fail", message: "Cart not found" });

            // Calculate total and items again (security)
            const productIds = cart.items.filter(i => i.productId).map(i => i.productId);
            const hamperIds = cart.items.filter(i => i.hamperId).map(i => i.hamperId);
            const customHamperIds = cart.items.filter(i => i.customHamperId).map(i => i.customHamperId);

            const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
            const hampers = await prisma.customHamper.findMany({ where: { id: { in: [...hamperIds, ...customHamperIds] } } });

            for (const item of cart.items) {
                let price = 0;
                if (item.productId) {
                    const product = products.find(p => p.id === item.productId);
                    if (product) price = product.price;
                } else if (item.hamperId || item.customHamperId) {
                    const hId = item.hamperId || item.customHamperId;
                    const hamper = hampers.find(h => h.id === hId);
                    if (hamper) price = hamper.totalPrice;
                }
                totalAmount += price * item.quantity;
                orderItemsData.push({
                    productId: item.productId,
                    hamperId: item.hamperId,
                    customHamperId: item.customHamperId,
                    quantity: item.quantity,
                    price: price,
                    customizationNote: item.customizationNote,
                    customizationImages: item.customizationImages
                });
            }
        }

        const order = await prisma.order.create({
            data: {
                userId,
                addressId: finalAddressId,
                totalAmount,
                paymentMode: "RAZORPAY",
                paymentStatus: "PAID",
                orderStatus: "PLACED",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // 3. Clear Cart if NOT direct
        if (!customHamperId) {
            const cart = await prisma.cart.findFirst({ where: { userId } });
            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: { cartId: cart.id }
                });
            }
        }

        res.status(200).json({ status: "success", data: order });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

