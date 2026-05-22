const prisma = require("../config/db");

// @route POST /api/listings
const createListing = async (req, res) => {
  try {
    const { title, description, category, quantity, unit, pricePerUnit, location, contactPhone } = req.body;

    const listing = await prisma.wasteListing.create({
      data: {
        title,
        description,
        category,
        quantity: parseFloat(quantity),
        unit: unit || "kg",
        pricePerUnit: parseFloat(pricePerUnit),
        location: location || req.user.location,
        contactEmail: req.user.email,
        contactPhone: contactPhone || null,
        sellerId: req.user.id,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/listings
const getListings = async (req, res) => {
  try {
    const { category, status, search } = req.query;

    const where = {
      status: status || "available",
    };

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const listings = await prisma.wasteListing.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, email: true, phone: true, location: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/listings/:id
const getListingById = async (req, res) => {
  try {
    const listing = await prisma.wasteListing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: { id: true, name: true, email: true, phone: true, location: true },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/listings/:id
const updateListing = async (req, res) => {
  try {
    const listing = await prisma.wasteListing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await prisma.wasteListing.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await prisma.wasteListing.findUnique({
      where: { id: req.params.id },
    });

    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.wasteListing.delete({ where: { id: req.params.id } });
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/listings/my/listings
const getMyListings = async (req, res) => {
  try {
    const listings = await prisma.wasteListing.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
};
