const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} = require("../controllers/listingController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.get("/", getListings);
router.get("/my/listings", protect, getMyListings);
router.get("/:id", getListingById);

// Private
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;
