import prisma from "../../lib/prisma.js";

export const createProduct = async (req, res) => {
    try {

        const { name, description, price, originalPrice, stock, categoryId, isActive, requiresImage, specifications, tags, occasions, productType } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Multer-storage-cloudinary puts the url in 'path'
        const images = files.map(file => file.path);

        let parsedSpecs = specifications;
        if (typeof specifications === 'string') {
            try {
                parsedSpecs = JSON.parse(specifications);
            } catch (e) {
                console.error("Failed to parse specifications JSON", e);
                parsedSpecs = {};
            }
        }

        // Parse tags
        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                const parsed = JSON.parse(tags);
                if (Array.isArray(parsed)) {
                    parsedTags = parsed;
                } else {
                    if (tags.includes(',')) parsedTags = tags.split(',').map(t => t.trim());
                    else parsedTags = [tags];
                }
            } catch (e) {
                if (tags.includes(',')) parsedTags = tags.split(',').map(t => t.trim());
                else parsedTags = [tags];
            }
        } else if (!Array.isArray(tags) && tags) {
            parsedTags = [tags];
        } else if (!tags) {
            parsedTags = [];
        }

        // Parse occasions
        let parsedOccasions = occasions;
        if (typeof occasions === 'string') {
            try {
                const parsed = JSON.parse(occasions);
                if (Array.isArray(parsed)) {
                    parsedOccasions = parsed;
                } else {
                    if (occasions.includes(',')) parsedOccasions = occasions.split(',').map(t => t.trim());
                    else parsedOccasions = [occasions];
                }
            } catch (e) {
                if (occasions.includes(',')) parsedOccasions = occasions.split(',').map(t => t.trim());
                else parsedOccasions = [occasions];
            }
        } else if (!Array.isArray(occasions) && occasions) {
            parsedOccasions = [occasions];
        } else if (!occasions) {
            parsedOccasions = [];
        }


        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseInt(price),
                originalPrice: originalPrice ? parseInt(originalPrice) : null,
                stock: parseInt(stock),
                categoryId,
                isActive: isActive === 'true' || isActive === true,
                requiresImage: requiresImage === 'true' || requiresImage === true,
                images,
                tags: parsedTags,
                occasions: parsedOccasions,
                occasions: parsedOccasions,
                specifications: parsedSpecs ?? undefined,
                productType: productType || 'SINGLE'
            }
        });

        res.status(201).json({
            status: "success",
            data: product
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message // Expose error message for debugging
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, originalPrice, stock, categoryId, isActive, requiresImage, specifications, tags, occasions, productType } = req.body;
        const files = req.files;

        // Construct update data
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = parseInt(price);
        if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseInt(originalPrice) : null;
        if (stock) updateData.stock = parseInt(stock);
        if (categoryId) updateData.categoryId = categoryId;
        if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
        if (requiresImage !== undefined) updateData.requiresImage = requiresImage === 'true' || requiresImage === true;
        if (productType) updateData.productType = productType;

        if (specifications) {
            let parsedSpecs = specifications;
            if (typeof specifications === 'string') {
                try {
                    parsedSpecs = JSON.parse(specifications);
                } catch (e) {
                    console.error("Failed to parse specifications JSON during update", e);
                }
            }
            updateData.specifications = parsedSpecs;
        }

        if (tags !== undefined) {
            let parsedTags = tags;
            if (typeof tags === 'string') {
                try {
                    const parsed = JSON.parse(tags);
                    if (Array.isArray(parsed)) {
                        parsedTags = parsed;
                    } else {
                        if (tags.includes(',')) parsedTags = tags.split(',').map(t => t.trim());
                        else parsedTags = [tags];
                    }
                } catch (e) {
                    if (tags.includes(',')) parsedTags = tags.split(',').map(t => t.trim());
                    else parsedTags = [tags];
                }
            } else if (!Array.isArray(tags) && tags) {
                parsedTags = [tags];
            } else if (!tags) {
                parsedTags = [];
            }
            updateData.tags = parsedTags;
        }

        if (occasions !== undefined) {
            let parsedOccasions = occasions;
            if (typeof occasions === 'string') {
                try {
                    const parsed = JSON.parse(occasions);
                    if (Array.isArray(parsed)) {
                        parsedOccasions = parsed;
                    } else {
                        if (occasions.includes(',')) parsedOccasions = occasions.split(',').map(t => t.trim());
                        else parsedOccasions = [occasions];
                    }
                } catch (e) {
                    if (occasions.includes(',')) parsedOccasions = occasions.split(',').map(t => t.trim());
                    else parsedOccasions = [occasions];
                }
            } else if (!Array.isArray(occasions) && occasions) {
                parsedOccasions = [occasions];
            } else if (!occasions) {
                parsedOccasions = [];
            }
            updateData.occasions = parsedOccasions;
        }

        // If new images are uploaded, append them or replace?
        // Typically replacing or appending. Let's append for now or replace if specified.
        // For simplicity: if images uploaded, replace ALL images or append?
        // Let's assume replace if images are provided, or we might need a more complex logic to remove specific ones.
        // For this MVP, if new images -> replace.
        if (files && files.length > 0) {
            const newImages = files.map(file => file.path);
            updateData.images = newImages;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({
            status: "success",
            data: product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { category, search, occasion, tags, minPrice, maxPrice } = req.query;

        const where = {};

        // Price Filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = parseInt(minPrice);
            if (maxPrice !== undefined) where.price.lte = parseInt(maxPrice);
        }

        if (category) {
            // Check if category is a valid ObjectId (regex for mongo objectId)
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);

            if (isObjectId) {
                where.categoryId = category;
            } else {
                where.category = {
                    slug: category
                };
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } }, // Exact match in array
                { occasions: { has: search } }
            ];
        }

        // Tag filtering (comma separated)
        // e.g. tags=for-him,romantic
        if (tags) {
            const tagsArray = tags.split(',').map(t => t.trim());
            if (tagsArray.length > 0) {
                if (where.OR) {
                    // If we already have a search query, we want (search match) AND (tags match)
                    // Prisma AND operator
                    if (!where.AND) where.AND = [];
                    where.AND.push({ tags: { hasSome: tagsArray } });
                } else {
                    where.tags = { hasSome: tagsArray };
                }
            }
        }

        // Occasion filtering (comma separated)
        if (occasion) {
            const occasionArray = occasion.split(',').map(o => o.trim());
            if (occasionArray.length > 0) {
                if (!where.AND) where.AND = [];
                // Push to AND array to ensure it combines with other filters
                where.AND.push({ occasions: { hasSome: occasionArray } });
            }
        }


        const products = await prisma.product.findMany({
            where,
            include: {
                category: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            }
        });

        res.status(200).json({
            status: "success",
            results: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({
                status: "fail",
                message: "Product not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

export const createBulkProducts = async (req, res) => {
    try {
        const { products } = req.body; // Expecting array of Product objects

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Products array is required" });
        }

        const validProducts = [];

        // Validate required fields
        for (const p of products) {
            if (!p.name || !p.description || p.price === undefined || p.stock === undefined || !p.categoryId) {
                return res.status(400).json({ status: "fail", message: "Name, description, price, stock, and categoryId are required for all products" });
            }
            if (isNaN(parseInt(p.price)) || isNaN(parseInt(p.stock))) {
                return res.status(400).json({ status: "fail", message: "Price and stock must be valid numbers" });
            }
            if (p.originalPrice && isNaN(parseInt(p.originalPrice))) {
                return res.status(400).json({ status: "fail", message: "Original price must be a valid number if provided" });
            }

            validProducts.push({
                name: p.name,
                description: p.description,
                price: parseInt(p.price),
                originalPrice: p.originalPrice ? parseInt(p.originalPrice) : null,
                stock: parseInt(p.stock),
                categoryId: p.categoryId,
                isActive: p.isActive !== undefined ? p.isActive : true,
                requiresImage: p.requiresImage !== undefined ? p.requiresImage : false,
                images: p.images || [], // URLs
                tags: p.tags || [],
                occasions: p.occasions || [],
                specifications: p.specifications || {},
                productType: p.productType || 'SINGLE'
            });
        }

        const result = await prisma.product.createMany({
            data: validProducts
        });

        res.status(201).json({
            status: "success",
            message: `${result.count} products created`,
            data: result
        });
    } catch (error) {
        console.error("Error creating bulk products:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
};
