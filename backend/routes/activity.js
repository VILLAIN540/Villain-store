const router = require("express").Router();
const Order = require("../models/Order");
const SendLog = require("../models/SendLog");

router.get("/", async (req, res) => {
  try {
    const orderId = String(req.query.orderId || "").trim();
    if (!orderId) return res.status(400).json({ error: "orderId query parameter is required" });
    const order = await Order.findOne({ orderId }).select("orderId product amount currency status createdAt");
    if (!order) return res.status(404).json({ error: "Order not found" });
    const logs = await SendLog.find({ orderId }).sort({ createdAt: -1 }).limit(20).select("uid region status message createdAt");
    res.json({ order, activity: logs });
  } catch {
    res.status(503).json({ error: "Database unavailable" });
  }
});

module.exports = router;
