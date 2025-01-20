import React, { useEffect, useState } from 'react';
import API from './Api'; // Ensure API is properly configured with baseURL and interceptors for error handling

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
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch shop info
  useEffect(() => {
    const fetchShopInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await API.get('/users/shopinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShopInfo(response.data);
        setFormData(response.data);
      } catch (err) {
        setError('Failed to fetch shop info. Please try again later.');
        console.error('Error fetching shop info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopInfo();
  }, [token]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save shop info
  const handleSave = async () => {
    setError('');
    try {
      const response = await API.put('/users/shopinfo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShopInfo(response.data.shopInfo);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update shop info. Please try again.');
      console.error('Error updating shop info:', err);
    }
  };

  // Render loading state
  if (loading) return <p>Loading...</p>;

  // Render error state
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Shop Info</h1>
      <div style={{ marginBottom: '15px' }}>
        <label>Owner Name:</label>
        {isEditing ? (
          <input
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <p>{shopInfo.ownerName}</p>
        )}
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Shop Name:</label>
        {isEditing ? (
          <input
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <p>{shopInfo.shopName}</p>
        )}
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        {isEditing ? (
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <p>{shopInfo.email}</p>
        )}
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Phone:</label>
        {isEditing ? (
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <p>{shopInfo.phone}</p>
        )}
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Address:</label>
        {isEditing ? (
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <p>{shopInfo.address}</p>
        )}
      </div>
      {isEditing ? (
        <button onClick={handleSave} style={{ marginRight: '10px' }}>
          Save
        </button>
      ) : (
        <button onClick={() => setIsEditing(true)} style={{ marginRight: '10px' }}>
          Edit
        </button>
      )}
      {isEditing && (
        <button onClick={() => setIsEditing(false)} style={{ marginLeft: '10px' }}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default ShopInfo;
