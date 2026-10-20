const mongoose = require("mongoose");

const SendLogSchema = new mongoose.Schema({
  orderId: { type: String, index: true },
  uid: { type: String, required: true },
  region: { type: String, required: true },
  status: { type: String, enum: ["queued", "success", "failed"], default: "queued" },
  message: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.models.SendLog || mongoose.model("SendLog", SendLogSchema);
