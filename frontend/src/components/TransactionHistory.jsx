import React, { useState, useEffect } from "react";
import API from "./Api";
import './Transactionhistory.css';

const StockHistory = () => {
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [stocks, setStocks] = useState([]);  // To store available stocks for selection
  const [selectedStock, setSelectedStock] = useState("");  // To store selected stockId
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");  // Category filter
  const [nameFilter, setNameFilter] = useState("");  // Stock name filter
  const [quantityFilter, setQuantityFilter] = useState("");  // Quantity filter
  const [startDate, setStartDate] = useState("");  // Start date filter
  const [endDate, setEndDate] = useState("");  // End date filter
  const [filteredHistory, setFilteredHistory] = useState([]);  // Filtered transaction history

  useEffect(() => {
    fetchStocks();
    fetchTransactionHistory();
  }, []);

  // Fetch stocks for the dropdown
  const fetchStocks = async () => {
    try {
      const { data } = await API.get("/stocks");
      setStocks(data.stocks || []);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      setError("Failed to fetch stocks.");
    }
  };

  // Fetch transaction history from API
  const fetchTransactionHistory = async (stockId = "") => {
    try {
      setError(null);
      const { data } = await API.get(`/stocks/history?stockId=${stockId}`);
      setTransactionHistory(data.history || []);
      setFilteredHistory(data.history || []);  // Set the full history initially
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError("Failed to fetch transaction history.");
    }
  };

  // Handle stock selection and fetch history for selected stock
  const handleStockChange = (e) => {
    const stockId = e.target.value;
    setSelectedStock(stockId);
    fetchTransactionHistory(stockId);  // Fetch history for the selected stock
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = transactionHistory;

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(
        (transaction) => transaction.stockId?.category === categoryFilter
      );
    }

    // Filter by stock name
    if (nameFilter) {
      filtered = filtered.filter(
        (transaction) => transaction.stockId?.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Filter by quantity change
    if (quantityFilter) {
      filtered = filtered.filter(
        (transaction) =>
          (quantityFilter === "increase" && transaction.quantityChange > 0) ||
          (quantityFilter === "decrease" && transaction.quantityChange < 0)
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((transaction) => new Date(transaction.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((transaction) => new Date(transaction.date) <= new Date(endDate));
    }

    setFilteredHistory(filtered);
  };

  // Get unique categories for category filter
  const categories = [
    ...new Set(transactionHistory.map((transaction) => transaction.stockId?.category)),
  ];

  return (
    <div className="transaction-history">
      <h2>Stocks History</h2>

      {/* Stock Selection Dropdown */}
      <div className="stock-filter">
        <label htmlFor="stockSelect">Select Stock:</label>
        <select
          id="stockSelect"
          value={selectedStock}
          onChange={handleStockChange}
        >
          <option value="">All Stocks</option>
          {stocks.map((stock) => (
            <option key={stock._id} value={stock._id}>
              {stock.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label htmlFor="categoryFilter">Filter by Category:</label>
        <select
          id="categoryFilter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Name Filter */}
      <div className="name-filter">
        <label htmlFor="nameFilter">Filter by Stock Name:</label>
        <input
          type="text"
          id="nameFilter"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
      </div>

      {/* Quantity Change Filter */}
      <div className="quantity-filter">
        <label htmlFor="quantityFilter">Filter by Quantity Change:</label>
        <select
          id="quantityFilter"
          value={quantityFilter}
          onChange={(e) => setQuantityFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button onClick={applyFilters}>Apply Filters</button>

      {error && <p className="error-message">{error}</p>}

      {/* Display filtered transaction history */}
      <ul className="transaction-table">
        {filteredHistory.length > 0 ? (
          <>
            <thead>
              <tr>
                <th>Stock Name</th>
                <th>Category</th>
                <th>Quantity Change</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.stockId?.name || "Unknown"}</td>
                  <td>{transaction.stockId?.category || "Unknown"}</td>
                  <td
                    className={
                      transaction.quantityChange < 0 ? "negative" : "positive"
                    }
                  >
                    {transaction.quantityChange}
                  </td>
                  <td>{new Date(transaction.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          <p className="no-transactions">No transactions recorded.</p>
        )}
      </ul>
    </div>
  );
};

export default StockHistory;
