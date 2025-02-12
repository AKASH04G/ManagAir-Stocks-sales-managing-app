import React, { useEffect, useState } from 'react';
import './SalesList.css'; // Assuming you're creating an external CSS file for styling
import API from './Api';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    sortBy: 'saleDate',
    order: 'desc',
    customerName: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    const fetchShopInfo = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await API.get('/users/shopinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShopInfo(response.data);
      } catch (err) {
        console.error('Error fetching shop info:', err);
      }
    };
    fetchShopInfo();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value.trim(),
    }));
  };

  const fetchSales = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await API.get('/sales/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data.sales);
      setFilteredSales(response.data.sales);
      setError('');
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    let filtered = [...sales];

    if (filters.customerName) {
      filtered = filtered.filter((sale) =>
        sale.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.saleDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.saleDate) <= new Date(filters.endDate)
      );
    }

    filtered.sort((a, b) => {
      let sortField = filters.sortBy;
      return filters.order === 'asc'
        ? new Date(a[sortField]) - new Date(b[sortField])
        : new Date(b[sortField]) - new Date(a[sortField]);
    });

    setFilteredSales(filtered);
  }, [filters, sales]);

  const handleSaleClick = (sale) => {
    setSelectedSale(selectedSale?._id === sale._id ? null : sale);
  };

  const handlePrint = (sale) => {
    if (!shopInfo) return;

    const printWindow = window.open('', '', 'height=500, width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sale Bill</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .bill { border: 1px dashed #000; padding: 10px; width: 80%; margin: 0 auto; }
            .bill h3 { text-align: center; }
            .bill p { margin: 5px 0; }
            .bill table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .bill table, .bill th, .bill td { border: 1px solid #000; padding: 5px; }
            .bill th { text-align: left; }
            .shop-info { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="shop-info">
            <h2>${shopInfo.shopName}</h2>
            <p>${shopInfo.address}</p>
            <p>Phone: ${shopInfo.phone}</p>
          </div>
          <div class="bill">
            <h3>Sales Invoice</h3>
            <p><strong>Customer:</strong> ${sale.customerName}</p>
            <p><strong>Date:</strong> ${new Date(sale.saleDate).toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                 <th colspan=2>Description</th>
                   <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map(item => `
                  <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.total}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p><strong>Sub Total:</strong> ₹${sale.subTotal}</p>
            <p><strong>Tax</strong> ${sale.tax}%</p>
            <p><strong>Discount:</strong> ₹${sale.discount}%</p>
            <p><strong>Total Amount:</strong> ₹${sale.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${sale.paymentMethod||"Cash"}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="sales-list-container">
      <h2>Sales List</h2>
      <div className="sales-list-filters">
        <label>Customer Name:</label>
        <input
          type="text"
          name="customerName"
          value={filters.customerName}
          onChange={handleFilterChange}
          placeholder="Search by customer name"
        />
        <label>From Date:</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <label>To Date:</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <label>Sort By:</label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
        >
          <option value="saleDate">Date</option>
          <option value="totalAmount">Total Amount</option>
        </select>
        <label>Order:</label>
        <select
          name="order"
          value={filters.order}
          onChange={handleFilterChange}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul className="sales-list">
        {filteredSales.length === 0 ? (
          <li>No sales found with the selected filters.</li>
        ) : (
          filteredSales.map((sale) => (
            <li
              key={sale._id}
              className="sale-item"
              onClick={() => handleSaleClick(sale)}
            >
              <p className="customer-name">Customer: {sale.customerName}</p>
              <p>Total: ₹{sale.totalAmount}</p>
              <p>Date: {new Date(sale.saleDate).toLocaleDateString()}</p>
              {selectedSale && selectedSale._id === sale._id && (
                <div className="sale-details">
                  <h4>Sale Details</h4>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {sale.items.map((item, index) => (
                      <li key={index}>
                        {item.name} {(item.description )||''} - Quantity: {item.quantity}, Price: {item.price}, Total: {item.total}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Sub Total:</strong> ₹{sale.subTotal}</p>
                  <p><strong>Tax:</strong> {sale.tax}%</p>
                  <p><strong>Discount:</strong> {sale.discount}%</p>
                  <p><strong>Total Amount:</strong> ₹{sale.totalAmount}</p>
                  <p><strong>Payment Method:</strong> {sale.paymentMethod||"Cash"}</p>
                  <button onClick={() => handlePrint(sale)}>Print Bill</button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SalesList;
