const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    quantityChange: { type: Number, required: true }, // Positive for buy, negative for sell
    date: { type: Date, default: Date.now },
});

const History = mongoose.model('History', historySchema);
module.exports = History;
