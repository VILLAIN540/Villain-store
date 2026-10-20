require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const couponRoutes = require("./routes/coupon");
const sendRoutes = require("./routes/send");
const paymentRoutes = require("./routes/payment");
const activityRoutes = require("./routes/activity");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "BNS Gaming API", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/coupons", couponRoutes);
app.use("/api/send", sendRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/activity", activityRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 3000);
async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");
    } catch (e) {
      console.error("MongoDB connection failed:", e.message);
      console.warn("Server will run, but database-backed features may not work.");
    }
  }
  app.listen(port, () => console.log(`BNS Gaming API listening on port ${port}`));
}
start();
