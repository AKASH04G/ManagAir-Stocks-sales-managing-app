import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideNavbar.css';
import { FaHome, FaFileInvoice, FaClipboardList, FaChartLine, FaStoreAlt } from 'react-icons/fa';

const Sidenavbar = () => {
  return (
    <div className="sidenav">
      <h2 className="sidenav-header">ManagAir : Stock & Bill</h2>
      <ul className="sidenav-links">
        <li><NavLink to="/" className="sidenav-link" activeClassName="active"><FaHome />Home</NavLink></li>
        <li><NavLink to="/addbill" className="sidenav-link" activeClassName="active"><FaFileInvoice />Add-Bill</NavLink></li>
        <li><NavLink to="/stocks" className="sidenav-link" activeClassName="active"><FaClipboardList />Stocks</NavLink></li>
        <li><NavLink to="/sales" className="sidenav-link" activeClassName="active"><FaChartLine />Sales List</NavLink></li>
        <li><NavLink to="/shop-info" className="sidenav-link" activeClassName="active"><FaStoreAlt />Shop Info</NavLink></li>
      </ul>
    </div>
  );
};

export default Sidenavbar;
