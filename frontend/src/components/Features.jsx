import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Features.css';
import API from './Api';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Features = () => {
  const [shopInfo, setShopInfo] = useState({});
  const [dailySales, setDailySales] = useState([]);
  const [totalBills, setTotalBills] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopInfo = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await API.get('/users/shopinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShopInfo(response.data);
      } catch (err) {
        setError('Failed to fetch shop info. Please try again later.');
        console.error('Error fetching shop info:', err);
      }
    };

    const fetchDailySales = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await API.get('/sales/dailysales', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { totalBills, totalSalesAmount, topSellingProducts } = response.data;
        setDailySales(topSellingProducts);
        setTotalBills(totalBills);
        setTotalAmount(totalSalesAmount);
      } catch (err) {
        setError('Failed to fetch daily sales details. Please try again later.');
        console.error('Error fetching daily sales:', err);
      }
    };

    fetchShopInfo();
    fetchDailySales();
  }, []);

  const salesData = {
    labels: dailySales.map(sale => sale.name),
    datasets: [
      {
        data: dailySales.map(sale => sale.quantity),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderWidth: 1,
        cutout: '70%', // This makes the pie chart a donut chart
      },
    ],
  };

  return (
    <div className="main-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-message">
          <h1>Welcome {shopInfo.shopName || ' '}!</h1>
          <p>Manage your stock, bills, and much more with ease.</p>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="error">{error}</p>}

      {/* Features Section */}
      <div className="features">
        <h2>Features of Our Application</h2>
        <div className="feature-links">
          <Link to="/dashboard" className="feature-link">
            <div className="feature-card">
              <h3>Dashboard</h3>
              <p>Get a quick overview of your shop's activity and performance.</p>
            </div>
          </Link>
          <Link to="/stocks" className="feature-link">
            <div className="feature-card">
              <h3>Stock Management</h3>
              <p>Track, manage, and update your stock in real-time.</p>
            </div>
          </Link>
          <Link to="/sales" className="feature-link">
            <div className="feature-card">
              <h3>Sales List</h3>
              <p>View and manage the sales transactions made in your shop.</p>
            </div>
          </Link>
          <Link to="/addbill" className="feature-link">
            <div className="feature-card">
              <h3>Add Bill</h3>
              <p>Quickly add new bills and update your records.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Extra Features Section */}
      <div className="extra-features">
        <h2>Additional Features</h2>
        <div className="feature-links">
          <Link to="/shop-info" className="feature-link">
            <div className="feature-card">
              <h3>Shop Info</h3>
              <p>Update your shop information and keep it current.</p>
            </div>
          </Link>
          <Link to="/stockhistory" className="feature-link">
            <div className="feature-card">
              <h3>Stock History</h3>
              <p>Review your stock history and track changes over time.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Daily Sales Details */}
      <div className="sales-details">
        <h2>Daily Sales Details</h2>
        <div className="daily-sales-boxes">
          <div className="sales-box total-bills">
            <h3>Total Bills</h3>
            <p>{totalBills}</p>
          </div>
          <div className="sales-box total-amount">
            <h3>Total Amount</h3>
            <p>{totalAmount} ₹</p>
          </div>
          <div className="sales-box pie-chart">
            <Pie data={salesData} />
          </div>
        </div>
      </div>

      {/* View Dashboard Button */}
      <div className="view-dashboard">
        <button onClick={() => navigate('/dashboard')}>View Dashboard</button>
      </div>
    </div>
  );
};

export default Features;
