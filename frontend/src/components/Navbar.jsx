import React, { useEffect, useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { IoIosInformationCircleOutline } from 'react-icons/io'; // Import the 'i' icon
import './Navbar.css';
import Sidenavbar from './SideNavbar';
import API from './Api'; // Ensure API is properly configured with baseURL and interceptors for error handling
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown visibility
  const [shopInfo, setShopInfo] = useState(null);
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown menu
  };

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

  // Logout function
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    window.location.reload(); // Refresh the page to reflect the change
  };

  // Extract initials from the owner's name
  const getInitials = (name) => {
    const nameParts = name.split(' ');
    return nameParts.length > 1
      ? nameParts[0].charAt(0) + nameParts[1].charAt(0)
      : nameParts[0].charAt(0) + nameParts[0].charAt(1);
  };
  
const shopinfonavi=()=>{
    navigate("/shop-info")
}
  return (
    <>
      <Sidenavbar />
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>{formData.shopName}</h1>
        </div>
        <div className="navbar-user">
          {/* Add the new 'i' icon for the Features page */}
          <div className="info-icon">
            <a href="/features" alt="Features">
              <IoIosInformationCircleOutline size={34} />
            </a>
          </div>
          <div className="user-icon" onClick={toggleDropdown}>
            {/* Display initials of the owner */}
            {formData.ownerName && getInitials(formData.ownerName).toUpperCase()}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <ul>
                <li>{formData.ownerName}</li>
                <li>{formData.email}</li>
                <li onClick={shopinfonavi} className="dropdown-link" >
                    Shop Info
                  
                </li>
                <li onClick={logout} className="dropdown-link" style={{color:"#e73434"}} >
                  <FaSignOutAlt /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
