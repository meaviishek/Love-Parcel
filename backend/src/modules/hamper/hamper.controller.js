import prisma from "../../lib/prisma.js";

export const getHamperBoxes = async (req, res) => {
    try {
        const boxes = await prisma.hamperBox.findMany();
        res.status(200).json({ status: "success", data: boxes });
    } catch (error) {
        console.error("Error fetching hamper boxes:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createBulkHamperBoxes = async (req, res) => {
    try {
        const { boxes } = req.body; // Expecting array of { name, minItems, basePrice, image }

        if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
            return res.status(400).json({ status: "fail", message: "Boxes array is required" });
        }

        // Validate required fields
        for (const b of boxes) {
            if (!b.name || b.minItems === undefined || b.basePrice === undefined) {
                return res.status(400).json({ status: "fail", message: "Name, minItems, and basePrice are required for all boxes" });
            }
            if (isNaN(parseInt(b.minItems)) || isNaN(parseInt(b.basePrice))) {
                return res.status(400).json({ status: "fail", message: "minItems and basePrice must be valid numbers" });
            }
        }

        const result = await prisma.hamperBox.createMany({
            data: boxes.map(b => ({
                name: b.name,
                minItems: parseInt(b.minItems),
                basePrice: parseInt(b.basePrice),
                image: b.image || null
            }))
        });

        res.status(201).json({
            status: "success",
            message: `${result.count} boxes created`,
            data: result
        });
    } catch (error) {
        console.error("Error creating bulk boxes:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getHamperItems = async (req, res) => {
    try {
        const { category } = req.query;
        const where = { isActive: true };

        // Populate category relation to get name/slug
        const include = { category: true };

        if (category) {
            const cat = await prisma.category.findUnique({ where: { slug: category } });
            if (cat) where.categoryId = cat.id;
        }

        const items = await prisma.product.findMany({ where, include });

        const mappedItems = items.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0] || "",
            isAvailable: p.isActive,
            category: p.category ? p.category.name.toLowerCase() : "uncategorized", // Map to string name for frontend
            categoryId: p.categoryId,
            requiresImage: p.requiresImage,
            productType: p.productType
        }));

        res.status(200).json({ status: "success", data: mappedItems });
    } catch (error) {
        console.error("Error fetching hamper items:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createCustomHamper = async (req, res) => {
    try {
        // This is now "Finalize Hamper" usually, or Create from scratch at checkout
        // We will support creating a FRESH finalized hamper (as before)
        // OR updating a draft to finalized (handled via separate logic if we had draft ID)

        const { boxId, items, note, imageLinks } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        const box = await prisma.hamperBox.findUnique({ where: { id: boxId } });
        if (!box) return res.status(404).json({ status: "fail", message: "Box not found" });

        let totalPrice = box.basePrice;

        const validItems = [];
        const productIds = items.map(i => i.productId || i.hamperItemId).filter(id => id);

        if (productIds.length > 0) {
            const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });

            for (const reqItem of items) {
                const reqId = reqItem.productId || reqItem.hamperItemId;
                if (!reqId) continue;

                const dbProd = dbProducts.find(p => p.id === reqId);
                if (dbProd) {
                    totalPrice += dbProd.price * reqItem.quantity;
                    validItems.push({
                        productId: reqId,
                        quantity: reqItem.quantity,
                        customizationNote: reqItem.customizationNote || null,
                        customizationImages: reqItem.customizationImages || []
                    });
                }
            }
        }

        const customHamper = await prisma.customHamper.create({
            data: {
                userId,
                boxId,
                totalPrice,
                note: note || undefined,
                imageLinks: imageLinks || [],
                isDraft: false, // Finalized
                items: {
                    create: validItems
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json({ status: "success", data: customHamper });

    } catch (error) {
        console.error("Error creating custom hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

// Route to Add Item to a Draft Hamper (or create one)
export const addToDraftHamper = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { productId, quantity, customizationNote, customizationImages } = req.body;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        // Find active draft hamper
        let hamper = await prisma.customHamper.findFirst({
            where: { userId, isDraft: true }
        });

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });

        if (!hamper) {
            // Create new draft
            hamper = await prisma.customHamper.create({
                data: {
                    userId,
                    totalPrice: 0, // Will update as items added. No Box yet? Or Box separate. 
                    // Usually box selection is step 2. So usually start with 0 price or box price if selected later.
                    isDraft: true
                }
            });
        }

        // Add Item
        const addedPrice = product.price * quantity;

        await prisma.customHamper.update({
            where: { id: hamper.id },
            data: { totalPrice: hamper.totalPrice + addedPrice }
        });

        // Add Item logic
        const newItem = await prisma.customHamperItem.create({
            data: {
                hamperId: hamper.id,
                productId,
                quantity,
                customizationNote: customizationNote || null,
                customizationImages: customizationImages || []
            }
        });

        res.status(200).json({ status: "success", message: "Added to hamper", data: { hamperId: hamper.id, item: newItem } });

    } catch (error) {
        console.error("Error adding to draft hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const removeProductFromDraftHamper = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { productId } = req.body;

        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        const hamper = await prisma.customHamper.findFirst({
            where: { userId, isDraft: true },
            include: { items: true }
        });

        if (!hamper) return res.status(404).json({ status: "fail", message: "Draft hamper not found" });

        // Find items with this productId
        const targetItems = hamper.items.filter(i => i.productId === productId);
        if (targetItems.length === 0) return res.status(404).json({ status: "fail", message: "Item not found in hamper" });

        // Remove the last one (LIFO)
        const itemToRemove = targetItems[targetItems.length - 1];

        const product = await prisma.product.findUnique({ where: { id: productId } });
        const deductPrice = product ? (product.price * itemToRemove.quantity) : 0;

        await prisma.customHamperItem.delete({ where: { id: itemToRemove.id } });

        await prisma.customHamper.update({
            where: { id: hamper.id },
            data: { totalPrice: { decrement: deductPrice } }
        });

        res.status(200).json({ status: "success", message: "Item removed from draft" });

    } catch (error) {
        console.error("Error removing from draft hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getDraftHamper = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

        const hamper = await prisma.customHamper.findFirst({
            where: { userId, isDraft: true },
            include: { items: true }
        });

        if (!hamper) return res.status(200).json({ status: "success", data: null });

        // Enrich items
        const itemIds = hamper.items.map(i => i.productId);
        const itemDetails = await prisma.product.findMany({ where: { id: { in: itemIds } } });

        const enrichedItems = hamper.items.map(selection => {
            const product = itemDetails.find(p => p.id === selection.productId);
            // Return shape expected by frontend logic or adaptable
            // Since frontend handles grouping, we can return flat list
            return {
                ...selection, // includes customization fields
                product // details
            };
        });

        res.status(200).json({ status: "success", data: { ...hamper, items: enrichedItems } });

    } catch (error) {
        console.error("Error fetching draft hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const addItemToHamper = async (req, res) => {
    try {
        const { id } = req.params; // hamperId
        const { productId, quantity, customizationNote, customizationImages } = req.body;

        const hamper = await prisma.customHamper.findUnique({ where: { id } });
        if (!hamper) return res.status(404).json({ status: "fail", message: "Hamper not found" });

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });

        const addedPrice = product.price * quantity;

        await prisma.customHamper.update({
            where: { id },
            data: { totalPrice: hamper.totalPrice + addedPrice }
        });

        const newItem = await prisma.customHamperItem.create({
            data: {
                hamperId: id,
                productId,
                quantity,
                customizationNote: customizationNote || null,
                customizationImages: customizationImages || []
            }
        });

        res.status(200).json({ status: "success", data: newItem });

    } catch (error) {
        console.error("Error adding item to hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const removeItemFromHamper = async (req, res) => {
    try {
        const { id, itemId } = req.params; // hamperId, itemId

        const hamperItem = await prisma.customHamperItem.findUnique({
            where: { id: itemId },
            include: { hamper: true }
        });

        if (!hamperItem) return res.status(404).json({ status: "fail", message: "Item not found" });
        if (hamperItem.hamperId !== id) return res.status(400).json({ status: "fail", message: "Item does not belong to this hamper" });

        const product = await prisma.product.findUnique({ where: { id: hamperItem.productId } });
        const deductPrice = product ? (product.price * hamperItem.quantity) : 0;

        await prisma.customHamperItem.delete({ where: { id: itemId } });

        await prisma.customHamper.update({
            where: { id },
            data: { totalPrice: { decrement: deductPrice } }
        });

        res.status(200).json({ status: "success", message: "Item removed" });

    } catch (error) {
        console.error("Error removing item from hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getHamperById = async (req, res) => {
    try {
        const { id } = req.params;

        const hamper = await prisma.customHamper.findUnique({
            where: { id },
            include: {
                items: true
            }
        });

        if (!hamper) {
            return res.status(404).json({ status: "fail", message: "Hamper not found" });
        }

        const itemIds = hamper.items.map(i => i.productId);
        const itemDetails = await prisma.product.findMany({ where: { id: { in: itemIds } } });

        let boxDetails = null;
        if (hamper.boxId) {
            boxDetails = await prisma.hamperBox.findUnique({ where: { id: hamper.boxId } });
        }

        const enrichedItems = hamper.items.map(selection => {
            const product = itemDetails.find(p => p.id === selection.productId);
            const detail = product ? {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0] || ""
            } : null;

            return { ...selection, detail };
        });

        res.status(200).json({ status: "success", data: { ...hamper, items: enrichedItems, box: boxDetails } });

    } catch (error) {
        console.error("Error fetching hamper:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
