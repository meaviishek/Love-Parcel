export const adminOnly = (req, res, next) => {
    if (req.user && (req.user.platformRole === "ADMIN" || req.user.platformRole === "SUPER_ADMIN")) {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as admin" });
    }
};
