import prisma from "../../lib/prisma.js";

const getOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: { items: true }
        });
    }
    return cart;
};

export const addToCart = async (req, res) => {
    try {
        const { productId, hamperId, quantity, customHamperId, customization } = req.body;
        const userId = req.user?.id || req.body.userId; // Fallback for dev/testing

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        const cart = await getOrCreateCart(userId);



        // If customization or custom hamper exists, we typically don't merge items (or we check exact match, but simple is no merge)
        // If customizationId is present, we treat it as a unique line item.
        // If customHamperId is present, we treat it as a unique line item.

        let existingItem = null;
        if (!customHamperId) {
            // Check if item exists with SAME customization? 
            // Simplified logic: If customization provided, treat as unique? 
            // Or compare fields?
            // For now, if customization is present, we treat it as unique to avoid merging conflicts unless we check deep equality.
            // Let's assume unique if customization is present to be safe, or check simple nulls.
            if (!customization || (!customization.note && (!customization.imageLinks || customization.imageLinks.length === 0))) {
                existingItem = cart.items.find(item =>
                    (productId && item.productId === productId && !item.customHamperId && !item.customizationNote && item.customizationImages.length === 0)
                );
            }
        }

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + parseInt(quantity || 1),
                    customizationNote: customization?.note || null,
                    customizationImages: customization?.imageLinks || []
                }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId || null,
                    customHamperId: customHamperId || null,
                    quantity: parseInt(quantity || 1),
                    customizationNote: customization?.note || null,
                    customizationImages: customization?.imageLinks || []
                }
            });
        }

        res.status(200).json({ status: "success", message: "Item added to cart" });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || req.body.userId;
        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        // 1. Fetch Cart Structure
        const cart = await prisma.cart.findFirst({
            where: { userId },
            include: { items: true } // valid relation
        });

        if (!cart) {
            return res.status(200).json({ status: "success", data: { items: [] } });
        }


        // 2. Collect IDs
        const productIds = new Set();
        const customHamperIds = new Set();

        cart.items.forEach(item => {
            if (item.productId) productIds.add(item.productId);
            if (item.customHamperId) customHamperIds.add(item.customHamperId);
        });

        // 4. Fetch Custom Hampers & their nested IDs
        let customHampersMap = {};
        const boxIds = new Set();

        if (customHamperIds.size > 0) {
            const hampers = await prisma.customHamper.findMany({
                where: { id: { in: Array.from(customHamperIds) } },
                include: { items: true } // items usually works if CustomHamperItem is defined
            });

            hampers.forEach(h => {
                customHampersMap[h.id] = h;
                if (h.boxId) boxIds.add(h.boxId);
                if (h.items) {
                    h.items.forEach(hi => {
                        if (hi.productId) productIds.add(hi.productId);
                    });
                }
            });
        }

        // 5. Fetch Boxes
        let boxesMap = {};
        if (boxIds.size > 0) {
            const boxes = await prisma.hamperBox.findMany({
                where: { id: { in: Array.from(boxIds) } }
            });
            boxes.forEach(b => boxesMap[b.id] = b);
        }

        // 6. Fetch Products (All combined)
        const products = await prisma.product.findMany({
            where: { id: { in: Array.from(productIds) } },
            include: { category: true }
        });

        // 7. Enrich and Stitch Data
        const enrichedItems = cart.items.map(item => {
            let details = null;
            if (item.productId) details = products.find(p => p.id === item.productId);

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
                    box: box // Manually attached box
                };
            }

            return {
                ...item,
                details,
                customHamper: enrichedHamper,
                customization: (item.customizationNote || item.customizationImages.length > 0) ? {
                    note: item.customizationNote,
                    imageLinks: item.customizationImages
                } : null
            };
        });

        res.status(200).json({ status: "success", data: { ...cart, items: enrichedItems } });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        // We update CartItem directly

        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: parseInt(quantity) }
        });

        res.status(200).json({ status: "success", message: "Cart updated" });

    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body; // or req.query usually for delete, but body is fine if specified

        await prisma.cartItem.delete({
            where: { id: itemId }
        });

        res.status(200).json({ status: "success", message: "Item removed from cart" });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
