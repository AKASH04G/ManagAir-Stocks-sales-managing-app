const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ShopInfo = require('../models/ShopInfo');

// Get shop info for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const shopInfo = await ShopInfo.findOne({ userId: req.user.id });
        if (!shopInfo) {
            return res.status(404).json({ message: 'Shop info not found' });
        }
        res.json(shopInfo);
    } catch (err) {
        console.error('Error fetching shop info:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create or update shop info for the logged-in user
router.put('/', auth, async (req, res) => {
    try {
        const { ownerName, shopName, email, phone, address } = req.body;

        let shopInfo = await ShopInfo.findOne({ userId: req.user.id });

        if (shopInfo) {
            // Update existing shop info
            shopInfo = await ShopInfo.findOneAndUpdate(
                { userId: req.user.id },
                { ownerName, shopName, email, phone, address },
                { new: true }
            );
        } else {
            // Create new shop info
            shopInfo = new ShopInfo({
                ownerName,
                shopName,
                email,
                phone,
                address,
                userId: req.user.id,
            });
            await shopInfo.save();
        }

        res.json(shopInfo);
    } catch (err) {
        console.error('Error saving shop info:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
