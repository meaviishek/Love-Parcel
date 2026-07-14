import express from "express";
import { addToCart, getCart, updateCart, removeFromCart } from "./cart.controller.js";
import  protect from "../../lib/middleware/protect.middleware.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.put("/update", protect, updateCart);
router.delete("/remove", protect, removeFromCart);

export default router;
