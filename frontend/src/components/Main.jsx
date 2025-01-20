import React from 'react';
import { Routes, Route } from 'react-router-dom';
 import Dashboard from './Dashboard';
import StockManager from './StockManager';
import AddBill from './AddBill';
import SalesList from './SalesList';
 import ShopInfo from './ShopInfo';
import Navbar from './Navbar';
import StockHistory from './TransactionHistory';
import Features from './Features';
import Footer from './Footer';

const MainPage = () => {
  return (
    <div className="main-layout">
       <Navbar/>
      <div className="content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stocks" element={<StockManager />} />
          <Route path="/addbill" element={<AddBill />} />
          <Route path="/sales" element={<SalesList />} />
          <Route path="/shop-info" element={<ShopInfo />} />
          <Route path="/stockhistory" element={<StockHistory />} />
          <Route path="/features" element={<Features />} />
      
          <Route path="/" element={<Dashboard />} /> {/* Default to Dashboard */}
        </Routes>
      </div>
      <Footer/>
    </div>
  );
};

export default MainPage;
