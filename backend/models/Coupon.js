const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  maxUses: { type: Number, default: 1, min: 1 },
  uses: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
