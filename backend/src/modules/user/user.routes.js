import express from "express";
import { getMyAccount } from "./user.controller.js";
import protect from "../../lib/middleware/protect.middleware.js";

const router = express.Router();

router.get("/myaccount", protect, getMyAccount);

export default router;
