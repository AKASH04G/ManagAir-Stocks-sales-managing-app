const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
 
app.use(express.json());
app.use(cors());
const userRoutes = require('./routes/user');
const stockRoutes = require('./routes/stocks');
const saleRoutes=require('./routes/sale');
 app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/sales',saleRoutes);
 const PORT = process.env.PORT || 6000;
mongoose.connect(process.env.MONGO_URI )
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => console.log(err));
