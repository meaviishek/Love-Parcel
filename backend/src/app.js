import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import transporter from "../config/mail.config.js";
// import { localRedisClient } from "../config/redis.local.js";
// import { cloudRedisClient } from "../config/redis.cloud.js";
import { cashfreeWebhook } from "./lib/webhook/cashfreeWebhook.js";
import passport from "../src/config/passport.config.js";


dotenv.config();

const app = express();

// app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/public", express.static("public"));
app.use(cors({
  origin: true,
  credentials: true,
  exposeHeaders: ["set-cookie"]
}
));


/**
 *  Health check (root)
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

/**
 *  /health — used by Kubernetes liveness & readiness probes
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});






app.post(
  "/api/payments/cashfree/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body.toString("utf8");
    req.body = JSON.parse(req.rawBody);
    next();
  },
  cashfreeWebhook
);

import categoryRoutes from "./modules/category/category.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import hamperRoutes from "./modules/hamper/hamper.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes, { ordersRouter } from "./modules/order/order.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import userRoutes from "./modules/user/user.routes.js";

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/hamper", hamperRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/user", userRoutes);


export default app;
// forcing restart
