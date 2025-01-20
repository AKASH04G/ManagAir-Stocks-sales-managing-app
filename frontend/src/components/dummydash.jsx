import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import API from './Api'; // Use the configured Axios instance
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dayWiseSales, setDayWiseSales] = useState([]);
  const [monthWiseSales, setMonthWiseSales] = useState([]);
  const [yearWiseSales, setYearWiseSales] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await API.get('/sales/dashboard', { params: { month, year } });
  
      console.log("API Response Data:", response.data); // Log the response data
  
      const salesData = response.data.sales || [];
  
      if (salesData.length === 0) {
        setError('No sales data available.');
        setLoading(false);
        return;
      }
  
      // Process sales data by day
      const processSalesByDay = (data) => {
        const salesByDay = {};
        data.forEach(sale => {
          const day = new Date(sale.saleDate).getDate();
          salesByDay[day] = (salesByDay[day] || 0) + sale.totalAmount;
        });
        return Object.entries(salesByDay).map(([day, totalSales]) => ({ day: parseInt(day), totalSales }));
      };
  
      // Process sales data by month
      const processSalesByMonth = (data) => {
        const salesByMonth = {};
        data.forEach(sale => {
          const month = new Date(sale.saleDate).getMonth() + 1;
          salesByMonth[month] = (salesByMonth[month] || 0) + sale.totalAmount;
        });
        return Object.entries(salesByMonth).map(([month, totalSales]) => ({ month: parseInt(month), totalSales }));
      };
  
      // Process sales data by year
      const processSalesByYear = (data) => {
        const salesByYear = {};
        data.forEach(sale => {
          const year = new Date(sale.saleDate).getFullYear();
          salesByYear[year] = (salesByYear[year] || 0) + sale.totalAmount;
        });
        return Object.entries(salesByYear).map(([year, totalSales]) => ({ year: parseInt(year), totalSales }));
      };
  
      // Update state with processed data
      setDayWiseSales(processSalesByDay(salesData));
      setMonthWiseSales(processSalesByMonth(salesData));
      setYearWiseSales(processSalesByYear(salesData));
  
      // Best Selling Items
      const bestSellingItems = response.data.bestSellingItems || [];
      setBestSellingProducts(bestSellingItems);
  
      // Total Bill
      setTotalBill(response.data.totalSales);
  
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const dayWiseChartData = {
    labels: dayWiseSales.map(sale => `Day ${sale.day}`),
    datasets: [{ label: 'Sales by Day', data: dayWiseSales.map(sale => sale.totalSales), borderColor: 'blue', backgroundColor: 'rgba(0, 0, 255, 0.2)' }],
  };

  const monthWiseChartData = {
    labels: monthWiseSales.map(sale => `Month ${sale.month}`),
    datasets: [{ label: 'Sales by Month', data: monthWiseSales.map(sale => sale.totalSales), borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)' }],
  };

  const yearWiseChartData = {
    labels: yearWiseSales.map(sale => `Year ${sale.year}`),
    datasets: [{ label: 'Sales by Year', data: yearWiseSales.map(sale => sale.totalSales), borderColor: 'orange', backgroundColor: 'rgba(255, 165, 0, 0.2)' }],
  };

  return (
    <div className="dashboard">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="filters">
            <label>Month: 
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </label>
            <label>Year: 
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
          <div className="stats">
            <div className="stats-box">
              <h3>Total Bill</h3>
              <p>${totalBill}</p>
            </div>
            <div className="stats-box">
              <h3>Top Selling Products</h3>
              <ul>{bestSellingProducts.map((product, i) => <li key={i}>{product.name} - {product.count} Sales</li>)}</ul>
            </div>
          </div>
          <div className="charts">
            <h3>Sales Analytics</h3>
            <div className="chart-container">
              <Line data={dayWiseChartData} />
            </div>
            <div className="chart-container">
              <Line data={monthWiseChartData} />
            </div>
            <div className="chart-container">
              <Line data={yearWiseChartData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;