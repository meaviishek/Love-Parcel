
import { verifyRefreshToken, generateAccessToken } from "../../lib/jwt.js";
import { accessTokenCookieOptions } from "../../../config/cookies.config.js";

export const authenticateMe = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }


        // Generate a new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.platformRole,
        });

        return res
            .cookie("aToken", accessToken, accessTokenCookieOptions)
            .status(200).json({
                message: "User authenticated successfully",
                user: {
                    ...user,
                    addresses: user.addresses || []
                },
            });
    } catch (error) {
        console.error("authenticateController error ---->", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
