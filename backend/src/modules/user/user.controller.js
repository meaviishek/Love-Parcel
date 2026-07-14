import prisma from "../../lib/prisma.js";

/**
 * @desc    Get current user profile, addresses, and orders
 * @route   GET /api/user/myaccount
 * @access  Private
 */
export const getMyAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user with relations
        // Note: Using Promise.all often cleaner, but include works well for nested relations
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                platformRole: true,
                isEmailVerified: true,
                isPhoneVerified: true,
                // Include addresses
                addresses: {
                    orderBy: {
                        id: 'desc' // Newest first
                    }
                },
                // Include orders
                orders: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        items: true // Include order items for history
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: user
        });

    } catch (error) {
        console.error("Get My Account Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch account details"
        });
    }
};
