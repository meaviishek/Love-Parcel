import express from "express";
import { createOrder, getOrderById, getUserOrders, initiatePayment, verifyPayment } from "./order.controller.js";
import protect  from "../../lib/middleware/protect.middleware.js";


const router = express.Router();

// The user requested:
// POST   /api/order/create
// GET    /api/order/:id
// GET    /api/orders/user

router.post("/create", protect, createOrder); // /api/order/create
router.post("/payment/initiate", protect, initiatePayment);
router.post("/payment/verify", protect, verifyPayment);
router.get("/:id", protect, getOrderById);    // /api/order/:id

export const ordersRouter = express.Router();
ordersRouter.get("/user", protect, getUserOrders); // /api/orders/user

export default router;


// I will make a separate export or file for /api/orders if needed, or just handle it in app.js
