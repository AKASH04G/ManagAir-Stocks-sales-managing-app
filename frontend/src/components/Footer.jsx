import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/stocks">Stock Manager</Link></li>
            <li><Link to="/addbill">Add Bill</Link></li>
            <li><Link to="/sales">Sales List</Link></li>
            <li><Link to="/shop-info">Shop Info</Link></li>
            <li><Link to="/stockhistory">Stock History</Link></li>
            <li><Link to="/features">Features</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li>Email: support@yourcompany.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 123 Business St, City, Country</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <ul className="social-links">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 ManagAir. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
