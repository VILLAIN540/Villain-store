const router = require("express").Router();
const Coupon = require("../models/Coupon");

router.post("/validate", async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    if (!code) return res.status(400).json({ error: "Coupon code is required" });
    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ error: "Coupon not found or inactive" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Coupon expired" });
    if (coupon.uses >= coupon.maxUses) return res.status(400).json({ error: "Coupon usage limit reached" });
    res.json({ valid: true, discountPercent: coupon.discountPercent });
  } catch {
    res.status(503).json({ error: "Database unavailable or coupon check failed" });
  }
});

// Admin coupon creation intentionally omitted until an authenticated admin system is configured.
module.exports = router;
