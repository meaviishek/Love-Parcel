import prisma from "../../../lib/prisma.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
    );
};

export const googleLoginService = async (userData) => {
    try {
        const { googleId, email, name, avatar } = userData;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // Check if we need to update verification or link google account
            const updateData = {};
            let needsUpdate = false;

            if (!user.isEmailVerified) {
                updateData.isEmailVerified = true;
                needsUpdate = true;
            }

            if (!user.googleId) {
                updateData.googleId = googleId;
                updateData.avatar = avatar;
                needsUpdate = true;
            }

            if (needsUpdate) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    googleId,
                    avatar,
                    isEmailVerified: true,
                },
            });
        }

        const token = generateToken(user);
        return { user, token };

    } catch (error) {
        console.error("Error in googleLoginService:", error);
        throw error;
    }
};
