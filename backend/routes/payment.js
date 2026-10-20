const router = require("express").Router();
const crypto = require("crypto");
const Order = require("../models/Order");

router.post("/create-order", async (req, res) => {
  try {
    const product = String(req.body.product || "").trim();
    const uid = String(req.body.uid || "").trim();
    const region = String(req.body.region || "").trim().toLowerCase();
    const amount = Number(req.body.amount);
    if (!product || !/^\d{5,20}$/.test(uid) || !region || !Number.isFinite(amount) || amount < 1 || amount > 100000) {
      return res.status(400).json({ error: "Provide product, numeric UID, region, and amount between ₹1 and ₹100000" });
    }

    const orderId = "BNS-" + crypto.randomUUID();
    const order = await Order.create({ orderId, product, uid, region, amount, currency: process.env.PAYMENT_CURRENCY || "INR" });

    const apiUrl = process.env.FAMGATEWAY_API_URL;
    const apiKey = process.env.FAMGATEWAY_API_KEY;
    if (!apiUrl || !apiKey || apiKey === "replace_with_your_private_api_key") {
      return res.status(201).json({ orderId, status: "pending", message: "Order created. Add valid FamGateway credentials in backend/.env to enable payment." });
    }

    // Provider response fields vary. Verify the official API documentation before relying on them.
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        redirect_url: `${req.protocol}://${req.get("host")}/api/payment/return?orderId=${encodeURIComponent(orderId)}`
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      order.status = "failed";
      order.providerResponse = { httpStatus: response.status };
      await order.save();
      return res.status(502).json({ error: "Payment provider rejected the request", orderId });
    }
    order.providerResponse = data;
    order.providerOrderId = data.order_id || data.id || null;
    order.paymentUrl = data.payment_url || data.checkout_url || data.url || null;
    await order.save();
    res.status(201).json({ orderId, status: order.status, paymentUrl: order.paymentUrl, providerMessage: order.paymentUrl ? undefined : "Provider response needs mapping to a checkout URL." });
  } catch (e) {
    console.error(e.message);
    res.status(503).json({ error: "Database or payment provider unavailable" });
  }
});

// A browser redirect is NOT proof of payment. Never mark paid from this route.
router.get("/return", (req, res) => {
  res.status(200).send("Payment return received. This page does not verify payment. Wait for a verified provider webhook.");
});

// Do not enable a webhook until official signature verification and provider payload mapping are implemented.
router.post("/webhook", (_req, res) => {
  res.status(501).json({ error: "Webhook verification is not configured. Orders will not be marked paid." });
});

router.get("/status/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).select("orderId status amount currency product createdAt");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch {
    res.status(503).json({ error: "Database unavailable" });
  }
});

module.exports = router;
