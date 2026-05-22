const prisma = require("../config/db");

// @route  GET /api/prices
// @access Public
const getPrices = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const prices = await prisma.priceGuide.findMany({
      where,
      orderBy: [{ category: "asc" }, { minPrice: "desc" }],
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/prices
// @access Admin only
const createPrice = async (req, res) => {
  try {
    const { category, material, minPrice, maxPrice, unit, grade, notes } = req.body;
    const price = await prisma.priceGuide.create({
      data: { category, material, minPrice: Number(minPrice), maxPrice: Number(maxPrice), unit: unit || "kg", grade, notes },
    });
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/prices/:id
// @access Admin only
const updatePrice = async (req, res) => {
  try {
    const { category, material, minPrice, maxPrice, unit, grade, notes } = req.body;
    const updated = await prisma.priceGuide.update({
      where: { id: req.params.id },
      data: {
        ...(category && { category }),
        ...(material && { material }),
        ...(minPrice && { minPrice: Number(minPrice) }),
        ...(maxPrice && { maxPrice: Number(maxPrice) }),
        ...(unit && { unit }),
        ...(grade !== undefined && { grade }),
        ...(notes !== undefined && { notes }),
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/prices/:id
// @access Admin only
const deletePrice = async (req, res) => {
  try {
    await prisma.priceGuide.delete({ where: { id: req.params.id } });
    res.json({ message: "Price entry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPrices, createPrice, updatePrice, deletePrice };
