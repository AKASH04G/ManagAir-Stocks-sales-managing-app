const express = require('express');
const auth = require('../middleware/auth');
const Sale = require('../models/Sale');
const router = express.Router();

// Add a new sale
router.post('/add', auth, async (req, res) => {
    try {
        const { items, subTotal, tax, discount, totalAmount, paymentMethod, customerName, contact, saleDate } = req.body;

        const newSale = new Sale({
            userId: req.user.id,
            customerName,
            contact,
            items,
            subTotal,
            tax,
            discount,
            totalAmount,
            paymentMethod,
            saleDate: saleDate || new Date(),
        });

        await newSale.save();
        res.status(201).json({ message: 'Sale added successfully', sale: newSale });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/dashboard', auth, async (req, res) => {
    const { day, month, year, startDate, endDate, type } = req.query;

    try {
        const filter = { userId: req.user.id };

        // Date filtering logic
        if (day && month && year) {
            const date = new Date(year, month - 1, day);
            filter.saleDate = { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
        } else if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            filter.saleDate = { $gte: start, $lt: end };
        } else if (year) {
            const start = new Date(year, 0, 1);
            const end = new Date(year + 1, 0, 0);
            filter.saleDate = { $gte: start, $lt: end };
        }

        if (startDate && endDate) {
            filter.saleDate = { $gte: new Date(startDate), $lt: new Date(endDate) };
        }

        const sales = await Sale.find(filter);

        // Aggregating metrics
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalBills = sales.length;

        const itemMetrics = {};
        const customerMetrics = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemMetrics[item.name]) {
                    itemMetrics[item.name] = { totalAmount: 0, totalQuantity: 0 };
                }
                itemMetrics[item.name].totalAmount += item.total;
                itemMetrics[item.name].totalQuantity += item.quantity;
            });

            if (!customerMetrics[sale.customerName]) {
                customerMetrics[sale.customerName] = { totalAmount: 0, totalBills: 0 };
            }
            customerMetrics[sale.customerName].totalAmount += sale.totalAmount;
            customerMetrics[sale.customerName].totalBills += 1;
        });

        // Remove slice to show all items
        const bestSellingItems = Object.entries(itemMetrics)
            .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
            .map(([name, metrics]) => ({ name, ...metrics }));

        const bestCustomers = Object.entries(customerMetrics)
            .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
            .map(([name, metrics]) => ({ name, ...metrics }));

        const newProductsCount = bestSellingItems.length;  // Assuming new products are calculated here

        res.status(200).json({
            totalSales,
            totalBills,
            bestSellingItems,
            bestCustomers,
            newProductsCount,
            sales, // The sales data for charting
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

 
router.get('/dailysales', auth, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const dailySales = await Sale.find({
            userId: req.user.id,
            saleDate: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalSalesAmount = dailySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalBills = dailySales.length;

        const productCount = {};
        const customerSpendings = {};

        dailySales.forEach(sale => {
            sale.items.forEach(item => {
                productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
            });

            if (!customerSpendings[sale.customerName]) {
                customerSpendings[sale.customerName] = 0;
            }
            customerSpendings[sale.customerName] += sale.totalAmount;
        });

        const topSellingProducts = Object.entries(productCount)
            .sort((a, b) => b[1] - a[1])
            .map(([name, quantity]) => ({ name, quantity }))
            .slice(0, 5);

        const bestCustomers = Object.entries(customerSpendings)
            .sort((a, b) => b[1] - a[1])
            .map(([name, totalAmount]) => ({ name, totalAmount }))
            .slice(0, 5);

        res.status(200).json({
            totalSalesAmount,
            totalBills,
            topSellingProducts,
            bestCustomers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Advanced search with sorting
router.get('/search', auth, async (req, res) => {
    const { query, sort = 'saleDate', order = 'desc', page = 1, limit = 10 } = req.query;

    try {
        const sales = await Sale.find({
            userId: req.user.id,
            $or: [
                { customerName: { $regex: query, $options: 'i' } },
                { contact: { $regex: query, $options: 'i' } },
            ],
        })
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.status(200).json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update sale details
router.put('/update/:id', auth, async (req, res) => {
    try {
        const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSale) return res.status(404).json({ message: 'Sale not found' });

        res.status(200).json({ message: 'Sale updated successfully', sale: updatedSale });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a sale
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
