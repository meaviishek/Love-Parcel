import { verifyRefreshToken } from "../jwt.js";
import { prisma } from "../../../config/prisma.js";

const protect = async (req, res, next) => {
  try {
    const rToken = req.cookies?.rToken;


    if (!rToken) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(rToken);


    if (!decoded?.userId) {
      throw new Error("Invalid token payload: userId missing");
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        platformRole: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        addresses: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach user context
    req.user = {
      ...user,
      platformRole: user.platformRole ?? user.platformRole,
    };
    // req.user = user;
    // req.platformRole = platformRole;

    next();
  } catch (error) {
    console.error("Protect Middleware Error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default protect;
