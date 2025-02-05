import React, { useEffect, useState } from 'react';
import API from './Api';
import { Pencil, Save, XCircle } from 'lucide-react';  // Importing icons
import './ShopInfo.css';

const ShopInfo = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchShopInfo = async () => {
      setLoading(true);
      try {
        const response = await API.get('/users/shopinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShopInfo(response.data);
        setFormData(response.data);
      } catch (err) {
        triggerPopup('fail', 'Failed to fetch shop info.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopInfo();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await API.put('/users/shopinfo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShopInfo(response.data.shopInfo);
      setIsEditing(false);
      triggerPopup('success', 'Shop info updated!');
    } catch (err) {
      triggerPopup('fail', 'Update failed.');
      console.error(err);
    }
  };

  const triggerPopup = (type, message) => {
    setPopup({ type, message });
    setTimeout(() => setPopup(null), 2000);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="shop-info-container">
      <div className="shop-info-header">
        <h1 >Shop Info</h1>
        {!isEditing && (
          <Pencil className="icon edit-icon" onClick={() => setIsEditing(true)} />
        )}
      </div>

      {['ownerName', 'shopName', 'email', 'phone', 'address'].map((field) => (
  <div key={field} className="shop-info-field">
    <label>
      {field
        .replace(/([A-Z])/g, ' $1')   // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
        .replace(/\b\w/g, (char) => char.toUpperCase())}  {/* Capitalize first letter of each word */}
    :</label>
    {isEditing ? (
      <input name={field} value={formData[field]} onChange={handleChange} />
    ) : (
      <p>{shopInfo[field]}</p>
    )}
  </div>
))}


      {isEditing && (
        <div className="shop-info-buttons">
          <button onClick={handleSave}>
            <Save className="icon1" /> Save
          </button>
          <button className="cancel" onClick={() => setIsEditing(false)}>
            <XCircle className="icon1" /> Cancel
          </button>
        </div>
      )}

      {popup && <div className={`popup ${popup.type}`}>{popup.message}</div>}
    </div>
  );
};

export default ShopInfo;
