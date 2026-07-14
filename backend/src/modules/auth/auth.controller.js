import { generateRefreshToken } from "../../lib/jwt.js";
import { refreshTokenCookieOptions } from "../../../config/cookies.config.js";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";

export const adminSignup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body || {};

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password and name are required" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                platformRole: "ADMIN",
                isEmailVerified: true, // Auto-verify admin for now or implement verification
            },
        });

        const payload = {
            userId: newUser.id,
            role: newUser.platformRole,
        };

        const refreshToken = generateRefreshToken(payload);

        res.cookie("rToken", refreshToken, refreshTokenCookieOptions);

        res.status(201).json({
            status: "success",
            message: "Admin created successfully",
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    platformRole: newUser.platformRole
                }
            }
        });

    } catch (error) {
        console.error("Admin signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if user is admin
        if (user.platformRole !== "ADMIN" && user.platformRole !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Access denied. Not an admin." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = {
            userId: user.id,
            role: user.platformRole,
        };

        const refreshToken = generateRefreshToken(payload);

        res.cookie("rToken", refreshToken, refreshTokenCookieOptions);

        res.status(200).json({
            status: "success",
            message: "Logged in successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    platformRole: user.platformRole,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const handleGoogleCallback = (req, res) => {
    try {
        const user = req.user;
        console.log("Google Callback User:", user);

        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
            // Or redirect to frontend login with error
            // return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
        }

        const payload = {
            userId: user.id,
            role: user.platformRole,
        };
        console.log("Generating Token Payload:", payload);

        const refreshToken = generateRefreshToken(payload);

        // await storeRefreshTokenInLocalRedis(refreshToken, user.id);

        // Redirect to frontend with success, or set cookie and redirect
        res.cookie("rToken", refreshToken, refreshTokenCookieOptions);

        // Redirect to frontend dashboard or home
        // Redirect to frontend dashboard or home
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

        // Check for redirect state
        const redirectPath = req.query.state || "/";

        // Ensure redirectPath starts with / to prevent external redirects
        const finalRedirect = redirectPath.startsWith("/") ? `${frontendUrl}${redirectPath}` : `${frontendUrl}`;

        return res.redirect(finalRedirect);

    } catch (error) {
        console.error("Google callback error:", error);
        // return res.status(500).json({ message: "Internal server error" });
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/auth`);
    }
}


export const logout = (req, res) => {
    try {
        res.clearCookie("aToken", refreshTokenCookieOptions);
        res.clearCookie("rToken", refreshTokenCookieOptions);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
