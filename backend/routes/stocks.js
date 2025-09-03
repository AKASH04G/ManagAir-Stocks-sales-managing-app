const express = require('express');
const Stock = require('../models/Stocks');
const auth = require('../middleware/auth');
const Joi = require('joi');
const History = require('../models/History');
const router = express.Router();

// Validation function for stock inputs
const validateStock = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(0).required(),
        price: Joi.number().precision(2).min(0).required(),
        category: Joi.string().required(),
    });
    return schema.validate(data);
};

// Middleware to check stock ownership
const checkStockOwnership = async (req, res, next) => {
    try {
        const stock = await Stock.findOne({ _id: req.params.id, userId: req.user.id });
        if (!stock) return res.status(404).json({ message: 'Stock not found' });

        req.stock = stock; // Pass stock data to the next handler if needed
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a new stock
router.post('/add', auth, async (req, res) => {
    const { error } = validateStock(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const { name, quantity, price, category } = req.body;

        const newStock = new Stock({
            name,
            quantity,
            price,
            category,
            userId: req.user.id,
        });

        // Save the new stock
        await newStock.save();

        // Log the addition in the history (with quantityChange of added stock)
        const historyEntry = new History({
            userId: req.user.id,
            stockId: newStock._id,
            quantityChange: quantity, // Log the quantity added
        });

        await historyEntry.save();
        res.status(201).json({ message: 'Stock added successfully', stock: newStock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all stocks for the logged-in user with pagination
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const stocks = await Stock.find({ userId: req.user.id })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ name: 1 }); // Sort alphabetically by name

        const total = await Stock.countDocuments({ userId: req.user.id });

        res.status(200).json({
            stocks,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search stocks by name or category
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        const stocks = await Stock.find({
            userId: req.user.id,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ],
        });
        res.status(200).json(stocks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update full details of stock
router.put('/update/:id', auth, checkStockOwnership, async (req, res) => {
    const { name, quantity, price, category } = req.body;

    // Validate the updated stock data
    const { error } = validateStock({ name, quantity, price, category });
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        // Log the transaction in the history (log quantity change)
        const quantityChange = quantity - req.stock.quantity; // Calculate the difference in quantity

        // Update stock details
        req.stock.name = name;
        req.stock.quantity = quantity;
        req.stock.price = price;
        req.stock.category = category;

        // Log the transaction in history
        const historyEntry = new History({
            userId: req.user.id,
            stockId: req.stock._id,
            quantityChange: quantityChange, // Log the quantity change
        });

        await Promise.all([req.stock.save(), historyEntry.save()]);

        res.status(200).json({ message: 'Stock updated successfully', stock: req.stock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete stock by ID
router.delete('/delete/:id', auth, checkStockOwnership, async (req, res) => {
    try {
        const quantityChange = -req.stock.quantity; // Quantity change for deletion (negative value)

        // Log the deletion in history
        const historyEntry = new History({
            userId: req.user.id,
            stockId: req.stock._id,
            quantityChange: quantityChange, // Log negative quantity to indicate deletion
        });

await Promise.all([
            Stock.findByIdAndDelete(req.stock._id), // Correct method to delete the stock
            historyEntry.save()
        ]);        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// View history of stock transactions
router.get('/history', auth, async (req, res) => {
    try {
        const { stockId } = req.query; // Accept stockId as a query parameter to filter history for a specific stock

        let history;
        if (stockId) {
            // If stockId is provided, filter by stockId
            history = await History.find({ userId: req.user.id, stockId })
                .populate('stockId', 'name category')
                .sort({ date: -1 });
        } else {
            // If stockId is not provided, return all history
            history = await History.find({ userId: req.user.id })
                .populate('stockId', 'name category')
                .sort({ date: -1 });
        }

        res.status(200).json({ history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
