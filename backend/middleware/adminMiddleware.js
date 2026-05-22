const adminProtect = (req, res, next) => {
  if (!req.user || req.user.adminRole !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

module.exports = { adminProtect };
