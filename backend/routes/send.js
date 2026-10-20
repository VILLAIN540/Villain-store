const router = require("express").Router();
const SendLog = require("../models/SendLog");
const Order = require("../models/Order");

const allowedRegions = new Set(["ind", "bd", "sg", "id", "me", "br", "vn", "eu", "th", "cis", "pk", "na", "us", "uk"]);

router.post("/", async (req, res) => {
  try {
    const orderId = String(req.body.orderId || "").trim();
    const uid = String(req.body.uid || "").trim();
    const region = String(req.body.region || "").trim().toLowerCase();
    if (!orderId || !/^\d{5,20}$/.test(uid) || !allowedRegions.has(region)) {
      return res.status(400).json({ error: "Valid orderId, numeric UID, and supported region are required" });
    }
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "paid") return res.status(403).json({ error: "Payment must be verified before delivery" });
    if (order.uid !== uid || order.region !== region) return res.status(400).json({ error: "UID/region do not match the paid order" });

    // Safe placeholder: integrate only an authorized API with provider documentation.
    const log = await SendLog.create({ orderId, uid, region, status: "queued", message: "Awaiting authorized delivery API configuration" });
    res.status(202).json({ accepted: true, logId: log._id, message: "Request queued; delivery API is not configured yet." });
  } catch {
    res.status(503).json({ error: "Database unavailable or delivery request failed" });
  }
});

module.exports = router;
