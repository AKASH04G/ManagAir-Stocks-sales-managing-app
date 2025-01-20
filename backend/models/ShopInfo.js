const mongoose = require('mongoose');

const shopInfoSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  shopName: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user
}, { timestamps: true });

module.exports = mongoose.model('ShopInfo', shopInfoSchema);
