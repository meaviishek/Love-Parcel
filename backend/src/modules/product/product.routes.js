import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, createBulkProducts } from "./product.controller.js";
import protect from "../../lib/middleware/protect.middleware.js";
import { upload } from "../../lib/upload.js";
import { adminOnly } from "../../lib/middleware/admin.middleware.js";

const router = express.Router();

router.get("/get-all", getProducts);
router.get("/get/:id", getProductById);
router.post("/create", protect, adminOnly, upload.array("images", 5), createProduct);
router.post("/bulk-create", protect, adminOnly, createBulkProducts);
router.put("/update/:id", protect, adminOnly, upload.array("images", 5), updateProduct);

export default router;
