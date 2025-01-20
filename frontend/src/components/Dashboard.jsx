import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import API from './Api';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState({
    startDate: '',
    endDate: '',
  });
  const [salesData, setSalesData] = useState(null);
  const [donutData, setDonutData] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newProducts, setNewProducts] = useState(0);
  const [bestCustomers, setBestCustomers] = useState([]);
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [period, setPeriod] = useState('day');

  const handleFilterChange = (period) => {
    setPeriod(period);
  };

  const groupByPeriod = (sales, period) => {
    const groupedData = {};
    sales.forEach((sale) => {
      const date = new Date(sale.saleDate);
      let key;
      if (period === 'day') {
        key = date.toDateString();
      } else if (period === 'month') {
        key = `${date.getMonth() + 1}-${date.getFullYear()}`;
      } else if (period === 'year') {
        key = date.getFullYear();
      }
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += sale.totalAmount;
    });
    return groupedData;
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await API.get('/sales/dashboard', {
          params: {
            startDate: selectedDate.startDate,
            endDate: selectedDate.endDate,
          },
        });
        const { sales, totalBills, bestSellingItems, bestCustomers, newProductsCount, totalSales } = response.data;

        const groupedSalesData = groupByPeriod(sales, period);

        setSalesData({
          labels: Object.keys(groupedSalesData),
          datasets: [
            {
              label: 'Sales (Rs)',
              data: Object.values(groupedSalesData),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return null; // If chartArea is not available, return null to avoid drawing
                }
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(75, 192, 192, 0.2)');  // Lighter color at the top
                gradient.addColorStop(1, 'rgba(75, 192, 192, 0.5)');  // Darker color at the bottom
                return gradient;
              },
              fill: true,  // Ensure the area under the line is filled
              
            },
          ],
        });

        const totalItems = bestSellingItems.reduce((acc, item) => acc + item.totalAmount, 0);
        const topItems = bestSellingItems.slice(0, 5);
        const others = bestSellingItems.slice(5);
        const othersQuantity = others.reduce((acc, item) => acc + item.totalAmount, 0);

        setDonutData({
          labels: [...topItems.map(item => item.name), 'Others'],
          datasets: [
            {
              data: [...topItems.map(item => item.totalAmount), othersQuantity],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF5733', '#FF6347'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF5733', '#FF6347'],
            },
          ],
        });

        setTotalOrders(totalBills);
        setTotalCustomers(bestCustomers.length);
        setNewProducts(newProductsCount);
        setBestCustomers(bestCustomers);
        setBestSellingItems(bestSellingItems);
        setTotalSales(totalSales);
      } catch (error) {
        console.error('Error fetching sales data', error);
      }
    };

    fetchSalesData();
  }, [selectedDate, period]);

  return (
    <div className="dashboard-container" style={{ marginLeft: '7cm' }}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <i className="dashboard-icon"> <img src="../dashboard.png" alt="Dashboard" className="dashboard-icon" /></i>
          <h2>Dashboard</h2>
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={selectedDate.startDate}
            onChange={(e) => setSelectedDate({ ...selectedDate, startDate: e.target.value })}
          /><h3>To</h3>
          <input
            type="date"
            value={selectedDate.endDate}
            onChange={(e) => setSelectedDate({ ...selectedDate, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Info boxes */}
      <div className="info-boxes">
        <div className="info-box">
          <h3>Total Sales</h3>
          <p>Rs.{totalSales}</p>
        </div>
        <div className="info-box">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="info-box">
          <h3>Total Customers</h3>
          <p>{totalCustomers}</p>
        </div>
        <div className="info-box">
          <h3>Products</h3>
          <p>{newProducts}</p>
        </div>
      </div>

      {/* Graphs */}
      <div className="charts">
        <div className="line-chart">
          <h2>
            Sales
            <div className="filter-buttons">
              <button onClick={() => handleFilterChange('day')}>Day</button>
              <button onClick={() => handleFilterChange('month')}>Month</button>
              <button onClick={() => handleFilterChange('year')}>Year</button>
            </div>
          </h2>
          {salesData && (
  <Line
    data={salesData}
    options={{
      responsive: true,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        datalabels: {
          display: false,
          formatter: (value) => {
            return `Rs.${value.toFixed(2)}`;
          },
          color: 'black',
        },
      },
      elements: {
        line: {
          tension: 0.3, // Smooth the line
        },
        point: {
          radius: 3, // Add dots to the line
        },
      },
    }}
  />
)}

        </div>

        <div className="donut-chart">
          <h2>Top Selling Items</h2>
          {donutData && (
          <Doughnut 
          data={donutData} 
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    const label = tooltipItem.label;
                    const value = tooltipItem.raw;
                    const total = tooltipItem.dataset.data.reduce((acc, item) => acc + item, 0);
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${label}: ${percentage}%`;
                  }
                }
              },
              datalabels: {
                display: false,
                formatter: (value, context) => {
                  const label = context.chart.data.labels[context.dataIndex];
                  const total = context.dataset.data.reduce((acc, item) => acc + item, 0);
                  const percentage = ((value / total) * 100).toFixed(2);
                  return `${label}: ${percentage}%`;
                },
                color: (context) => {
                  const datasetIndex = context.datasetIndex;
                  if (datasetIndex === 0) {
                    return 'white';
                  } else {
                    return '#FF6347';
                  }
                },
                font: {
                  weight:"bold",
                   size: 11,
                }
              }
            }
          }} 
        />
        
          )}
        </div>
      </div>

      {/* Best customers and best-selling items */}
      <div className="best-data-container">
        <div className="best-customers">
          <h4>Best Customers</h4>
          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>No. of Bills</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {bestCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td>{customer.name}</td>
                    <td>{customer.totalBills}</td>
                    <td>Rs.{customer.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="best-selling-items">
          <h4>Best-Selling Items</h4>
          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.totalQuantity}</td>
                    <td>Rs.{item.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
