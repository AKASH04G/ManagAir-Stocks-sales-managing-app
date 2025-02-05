import React, { useState, useEffect } from "react";
import API from "./Api";
import "./Stockmanager.css";
import { useNavigate } from "react-router-dom";

const StockManager = () => {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ name: "", quantity: 0, price: 0, category: "" });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantityFilter, setQuantityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingStock, setEditingStock] = useState(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setError(null);
      const { data } = await API.get("/stocks");
      setStocks(data.stocks || []);
    } catch (err) {
      setError("Failed to fetch stocks.");
    }
  };

  const addNewStock = async (e) => {
    e.preventDefault();
    try {
      if (!newStock.name || !newStock.quantity || !newStock.price || !newStock.category) {
        setError("Please fill all fields.");
        return;
      }
      await API.post("/stocks/add", newStock);
      fetchStocks();
      setNewStock({ name: "", quantity: 0, price: 0, category: "" });
      setShowAddStock(false);
      showPopup("Stock added successfully!", "success");
    } catch (err) {
      setError("Failed to add new stock.");
      showPopup("Failed to add new stock.", "error");
    }
  };

  const updateStockQuantity = async (id, changeAmount, changeType) => {
    try {
      if (changeAmount <= 0) {
        setError("Quantity change must be positive.");
        return;
      }
      const stock = stocks.find((stock) => stock._id === id);
      if (!stock) {
        setError("Stock not found.");
        return;
      }
      const updatedQuantity = changeType === "add" ? stock.quantity + changeAmount : stock.quantity - changeAmount;
      if (updatedQuantity < 0) {
        setError("Quantity cannot be less than zero.");
        return;
      }
      await API.put(`/stocks/update/${id}`, { quantity: updatedQuantity });
      fetchStocks();
      showPopup("Stock updated successfully!", "success");
    } catch (err) {
      setError("Failed to update stock.");
      showPopup("Failed to update stock.", "error");
    }
  };

  const deleteStock = async (id) => {
    try {
      await API.delete(`/stocks/delete/${id}`);
      setStocks(stocks.filter(stock => stock._id !== id));
      showPopup("Stock deleted successfully!", "success");
    } catch (err) {
      showPopup("Failed to delete stock.", "error");
    }
  };

  const handleEditClick = (stock) => {
    setEditingStock(stock);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedStock = {
        name: editingStock.name,
        quantity: editingStock.quantity,
        price: editingStock.price,
        category: editingStock.category,
      };
      await API.put(`/stocks/update/${editingStock._id}`, updatedStock);
      fetchStocks();
      setEditingStock(null);
      showPopup("Stock updated successfully!", "success");
    } catch (err) {
      setError("Failed to update stock.");
      showPopup("Failed to update stock.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesName = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuantity =
      quantityFilter === "" ||
      (quantityFilter === "below" && stock.quantity < 10) ||
      (quantityFilter === "above" && stock.quantity >= 10);
    const matchesCategory = categoryFilter === "" || stock.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesName && matchesQuantity && matchesCategory;
  });

  const showPopup = (message, type) => {
    const popup = document.createElement("div");
    popup.className = `popup-message ${type}`;
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 3000);
  };

  const stockhistory = () => {
    navigate('/stockhistory');
  };

  return (
    <div className="stock-manager-container-stockhistory">
      {error && <p className="error-stockhistory">{error}</p>}

      <div className="filter-container-stockhistory">
        <h3>Search Filters</h3>
        <div className="filter-item-stockhistory">
          <label>Search by Name</label>
          <input
            type="text"
            placeholder="Search stocks by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item-stockhistory">
          <label>Quantity</label>
          <select value={quantityFilter} onChange={(e) => setQuantityFilter(e.target.value)}>
            <option value="">All</option>
            <option value="below">Below 10</option>
            <option value="above">Above 10</option>
          </select>
        </div>
        <div className="filter-item-stockhistory">
          <label>Category</label>
          <input
            type="text"
            placeholder="Search by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="manage-stock-header-stockhistory">
        <h3>Manage Stock</h3>
        <div className="manage-stock-actions-stockhistory-bt">
          <button onClick={() => setShowAddStock(!showAddStock)} className="add-stock-btn-stockhistory">
            {showAddStock ? "- Add Stock" : "+ Add New Stock"}
          </button>
          <button className="manage-stock-history-link-stockhistory-bt" onClick={stockhistory}>
              Stock History →
          </button>
        </div>
      </div>

      {showAddStock && (
        <div className="add-new-stock-container-stockhistory">
          <h3>Add New Stock</h3>
          <form className="add-new-stock-form-stockhistory" onSubmit={addNewStock}>
            <label>Name</label>
            <input
              type="text"
              value={newStock.name}
              onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
            />
            <label>Quantity</label>
            <input
              type="number"
              value={newStock.quantity}
              onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
            />
            <label>Price</label>
            <input
              type="number"
              value={newStock.price}
              onChange={(e) => setNewStock({ ...newStock, price: Number(e.target.value) })}
            />
            <label>Category</label>
            <input
              type="text"
              value={newStock.category}
              onChange={(e) => setNewStock({ ...newStock, category: e.target.value })}
            />
            <button type="submit">Add Stock</button>
          </form>
        </div>
      )}

      <div className="stocks-container-stockhistory">
        <h3>Stock List</h3>
        <table className="stock-table-stockhistory">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock._id}>
                <td>{stock.name}</td>
                <td>
                  {editingStock && editingStock._id === stock._id ? (
                    <input
                      type="number"
                      value={editingStock.quantity}
                      onChange={(e) =>
                        setEditingStock({ ...editingStock, quantity: Number(e.target.value) })
                      }
                    />
                  ) : (
                    stock.quantity
                  )}
                </td>
                <td>{stock.price}</td>
                <td>{stock.category}</td>
                <td>
                  {editingStock && editingStock._id === stock._id ? (
                    <>
                      <button className="save-btn-stockhistory" onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button className="cancel-btn-stockhistory" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn-stockhistory" onClick={() => handleEditClick(stock)}>
                        Edit
                      </button>
                      <button className="delete-btn-stockhistory" onClick={() => deleteStock(stock._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockManager;
