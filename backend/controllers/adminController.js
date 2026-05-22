const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

// @route  GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalListings, activeListings, soldListings, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.wasteListing.count(),
      prisma.wasteListing.count({ where: { status: "available" } }),
      prisma.wasteListing.count({ where: { status: "sold" } }),
      prisma.user.count({ where: { suspended: true } }),
    ]);

    // Category breakdown
    const categoryBreakdown = await prisma.wasteListing.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });

    // Recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, suspended: true },
    });

    res.json({
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      suspendedUsers,
      categoryBreakdown,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        adminRole: true, phone: true, location: true,
        suspended: true, createdAt: true,
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/admin/users/:id/suspend
const toggleSuspend = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.adminRole === "admin") return res.status(400).json({ message: "Cannot suspend an admin" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended: !user.suspended },
    });
    res.json({ message: `User ${updated.suspended ? "suspended" : "unsuspended"}`, suspended: updated.suspended });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/admin/users/:id/make-admin
const makeAdmin = async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { adminRole: "admin" },
    });
    res.json({ message: `${updated.name} is now an admin` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.adminRole === "admin") return res.status(400).json({ message: "Cannot delete an admin" });

    // Delete their listings first
    await prisma.wasteListing.deleteMany({ where: { sellerId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User and their listings deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/admin/listings
const getListings = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    const listings = await prisma.wasteListing.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/admin/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await prisma.wasteListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    await prisma.wasteListing.delete({ where: { id: req.params.id } });
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/admin/listings/:id/status
const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.wasteListing.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/admin/seed
// Creates the first admin account
const seedAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // If user exists, just promote them
      await prisma.user.update({ where: { email }, data: { adminRole: "admin" } });
      return res.json({ message: "Existing user promoted to admin" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const admin = await prisma.user.create({
      data: { name, email, password: hashed, role: "both", adminRole: "admin" },
    });

    res.status(201).json({ message: "Admin created", email: admin.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats, getUsers, toggleSuspend, makeAdmin,
  deleteUser, getListings, deleteListing,
  updateListingStatus, seedAdmin,
};
