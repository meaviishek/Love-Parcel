import express from "express";
import passport from "passport";
import { handleGoogleCallback, logout, adminSignup, adminLogin } from "./auth.controller.js";
import protect from "../../lib/middleware/protect.middleware.js";
import { authenticateMe } from "./auth.me.js";

const router = express.Router();

router.get("/google", (req, res, next) => {
    const state = req.query.redirect;
    const authenticator = passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
        state: state
    });
    authenticator(req, res, next);
});

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL }),
    handleGoogleCallback
);

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);


router.get("/me", protect, authenticateMe)
router.get("/logout", protect, logout);

export default router;
