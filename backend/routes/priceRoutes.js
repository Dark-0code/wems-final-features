const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const { getPrices, createPrice, updatePrice, deletePrice } = require("../controllers/priceController");

// Public
router.get("/", getPrices);

// Admin only
router.post("/", protect, adminProtect, createPrice);
router.put("/:id", protect, adminProtect, updatePrice);
router.delete("/:id", protect, adminProtect, deletePrice);

module.exports = router;
