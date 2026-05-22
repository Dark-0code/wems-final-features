require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/prices", require("./routes/priceRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.get("/api/health", (req, res) => res.json({ status: "WEMS API running" }));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ SQLite database ready`);
});
