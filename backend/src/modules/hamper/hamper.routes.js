import express from "express";
import { getHamperItems, createCustomHamper, getHamperById, getHamperBoxes, addItemToHamper, removeItemFromHamper, addToDraftHamper, removeProductFromDraftHamper, getDraftHamper, createBulkHamperBoxes } from "./hamper.controller.js";

const router = express.Router();

router.get("/boxes", getHamperBoxes);
router.get("/items", getHamperItems);
router.get("/items", getHamperItems);
router.post("/boxes/bulk-create", createBulkHamperBoxes); // Temporary open or admin protected? Should be admin protected.
router.post("/create", createCustomHamper);
router.post("/add-item", addToDraftHamper); // POST /hamper/add-item (Draft)
router.post("/remove-item", removeProductFromDraftHamper); // POST /hamper/remove-item (Draft)
router.get("/draft", getDraftHamper); // GET /hamper/draft
router.post("/:id/items", addItemToHamper); // POST /hamper/:id/items
router.delete("/:id/items/:itemId", removeItemFromHamper); // DELETE /hamper/:id/items/:itemId
router.get("/:id", getHamperById);

export default router;
