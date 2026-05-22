const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
  getStats, getUsers, toggleSuspend, makeAdmin,
  deleteUser, getListings, deleteListing,
  updateListingStatus, seedAdmin,
} = require("../controllers/adminController");

// Public — create first admin (protected by secret key in body)
router.post("/seed", seedAdmin);

// All routes below require login + admin role
router.use(protect, adminProtect);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/suspend", toggleSuspend);
router.put("/users/:id/make-admin", makeAdmin);
router.delete("/users/:id", deleteUser);
router.get("/listings", getListings);
router.delete("/listings/:id", deleteListing);
router.put("/listings/:id/status", updateListingStatus);

module.exports = router;
