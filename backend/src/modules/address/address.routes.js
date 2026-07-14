import express from "express";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "./address.controller.js";
import protect from "../../lib/middleware/protect.middleware.js";

const router = express.Router();

router.get("/", protect, getAddresses);
router.post("/", protect, addAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

export default router;
