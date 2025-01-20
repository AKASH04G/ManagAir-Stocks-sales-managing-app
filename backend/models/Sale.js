const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: String,
  description: String,
  name: String,
  quantity: Number,
  price: Number,
  total: Number,
});

const saleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  contact: String,
  items: [itemSchema],
  subTotal: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  paymentMethod: String,
  saleDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sale', saleSchema);
