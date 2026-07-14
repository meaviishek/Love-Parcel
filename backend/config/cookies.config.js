

const isProduction = process.env.NODE_ENV === "production";
const isCrossSite = process.env.CROSS_SITE == "true";

export const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossSite ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  export const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossSite ? "none" : "lax",
    // path: "/api/v1/auth/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
