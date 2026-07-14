import express from "express";
import { getAllCategories, createCategory, createBulkCategories } from "./category.controller.js";
import protect from "../../lib/middleware/protect.middleware.js";
import { adminOnly } from "../../lib/middleware/admin.middleware.js";

const router = express.Router();

router.get("/get-all", getAllCategories);
router.post("/create", protect, adminOnly, createCategory);
router.post("/bulk-create", protect, adminOnly, createBulkCategories);

export default router;
