import prisma from "../../lib/prisma.js";

export const createCategory = async (req, res) => {
    try {
        const { name, slug, image } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                status: "fail",
                message: "Name and slug are required"
            });
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image
            }
        });

        res.status(201).json({
            status: "success",
            data: category
        });
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return res.status(400).json({
                status: "fail",
                message: "Category with this name or slug already exists"
            });
        }
        console.error("Error creating category:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

export const createBulkCategories = async (req, res) => {
    try {
        const { categories } = req.body; // Expecting array of { name, slug, image }

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ status: "fail", message: "Categories array is required" });
        }

        // Validate required fields
        for (const c of categories) {
            if (!c.name || !c.slug) {
                return res.status(400).json({ status: "fail", message: "Name and slug are required for all categories" });
            }
        }

        const result = await prisma.category.createMany({
            data: categories.map(c => ({
                name: c.name,
                slug: c.slug,
                image: c.image
            }))
        });

        res.status(201).json({
            status: "success",
            message: `${result.count} categories created`,
            data: result
        });
    } catch (error) {
        console.error("Error creating bulk categories:", error);
        // Handle unique constraint violation manually since skipDuplicates is not supported
        if (error.code === 'P2002') {
            return res.status(409).json({ status: "error", message: "One or more categories already exist (name or slug must be unique)" });
        }
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};
