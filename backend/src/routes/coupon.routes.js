import express from "express";
import { createCoupon, validateCoupon, getAllCoupons } from "../controllers/coupon.controller.js";
// import { protect, admin } from "../middleware/authMiddleware.js"; // Assessing if needed

const router = express.Router();

router.post("/create", createCoupon); // Add protect, admin middleware later if needed
router.post("/validate", validateCoupon);
router.get("/all", getAllCoupons);

export default router;
