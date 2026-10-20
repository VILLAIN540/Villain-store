require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

let dbReady = false;
const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  likesRemaining: { type: Number, default: 210 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const SendSchema = new mongoose.Schema({
  uid: String, region: String, likes: Number, status: String,
  createdAt: { type: Date, default: Date.now }
});
const Coupon = mongoose.model("Coupon", CouponSchema);
const Send = mongoose.model("Send", SendSchema);

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => { dbReady = true; console.log("MongoDB connected"); })
    .catch(err => console.error("MongoDB connection failed:", err.message));
}

app.get("/api/health", (_req, res) => res.json({
  ok: true, database: dbReady ? "connected" : "not-configured",
  likesProvider: Boolean(process.env.LIKES_API_URL),
  paymentProvider: Boolean(process.env.PAYMENT_CREATE_ORDER_URL)
}));

// Demo-safe validation. Actual delivery requires an authorized provider endpoint.
app.post("/api/likes/send", async (req, res) => {
  const { uid, coupon, region } = req.body || {};
  if (!/^\d{6,15}$/.test(String(uid || ""))) {
    return res.status(400).json({ error: "Enter a valid Free Fire UID." });
  }
  if (!coupon || !region) {
    return res.status(400).json({ error: "Coupon and region are required." });
  }
  if (!dbReady) {
    return res.status(503).json({ error: "Database is not connected. Configure MONGODB_URI first." });
  }
  try {
    const doc = await Coupon.findOne({ code: String(coupon).trim().toUpperCase(), active: true });
    if (!doc || doc.likesRemaining <= 0) {
      return res.status(400).json({ error: "Coupon invalid or has no likes remaining." });
    }
    // Do not fake a successful delivery. Connect a provider you are authorized to use.
    if (!process.env.LIKES_API_URL || !process.env.LIKES_API_KEY) {
      return res.status(503).json({
        error: "Likes provider is not configured. Add your authorized provider URL and API key in .env."
      });
    }
    return res.status(501).json({
      error: "Provider adapter needs to be implemented for your provider's documented API. No coupon was consumed."
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

app.get("/api/stats", async (_req, res) => {
  if (!dbReady) return res.json({ sends: 0, note: "Connect MongoDB to enable live stats." });
  try {
    const sends = await Send.countDocuments({ status: "success" });
    res.json({ sends });
  } catch { res.status(500).json({ error: "Could not load stats." }); }
});

// Admin coupon creation. Protect with a private key; replace with real admin authentication for production.
app.post("/api/admin/coupons", async (req, res) => {
  if (!process.env.ADMIN_KEY || req.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!dbReady) return res.status(503).json({ error: "Database is not connected." });
  const likes = Math.max(1, Math.min(100000, Number(req.body.likes) || 210));
  const code = ("LIKES-" + Math.random().toString(36).slice(2, 10)).toUpperCase();
  try {
    const created = await Coupon.create({ code, likesRemaining: likes });
    res.json({ code: created.code, likesRemaining: created.likesRemaining });
  } catch { res.status(500).json({ error: "Could not create coupon." }); }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Gaming store running on port ${PORT}`));
