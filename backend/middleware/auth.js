const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('Authorization header missing');
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.log('No authentication token provided');
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
 
        const user = await User.findById(verified.id);
        if (!user) {
            console.log('User not found:', verified.id);
            return res.status(404).json({ message: 'User associated with token not found' });
        }

        req.user = verified;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired, please log in again' });
        }
        res.status(500).json({ error: err.message });
    }
};


module.exports = auth;
