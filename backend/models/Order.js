const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  product: { type: String, required: true },
  uid: { type: String, required: true },
  region: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
  providerOrderId: { type: String, default: null },
  paymentUrl: { type: String, default: null },
  providerResponse: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
