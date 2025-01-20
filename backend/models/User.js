const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the shopInfo schema
const shopInfoSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    shopName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }],
    sales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }],
    shopInfo: shopInfoSchema, // Add shopInfo field
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
