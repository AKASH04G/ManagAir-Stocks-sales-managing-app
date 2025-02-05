import React, { useState } from 'react';
import API from './Api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Popup = ({ message, type, onClose }) => {
    return (
        <div className={`popup ${type}`} onClick={onClose}>
            {message}
        </div>
    );
};

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [popup, setPopup] = useState(null);
    const navigate = useNavigate();

    const showPopup = (message, type) => {
        setPopup({ message, type });
        setTimeout(() => setPopup(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/users/login', formData);
            localStorage.setItem('token', data.token);
            showPopup('Login successful', 'success');
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            showPopup(err.response?.data?.message || 'Login failed!', 'error');
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div className="login-page">
            {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}

            <div className="left-section">
                <div className="greeting-message">
                    <div className="app-title-container">
                        <h1 className="app-title">ManagAir: Bill & Stock</h1>
                    </div>
                    <h1>Welcome back,</h1>
                    <p>Login to manage your bills and stocks efficiently.</p>
                </div>
            </div>
            <div className="right-section">
                <div className="login-container">
                    <div className="login-form">
                        <h2>Login</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                required 
                            />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={formData.password} 
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                required 
                            />
                            <button className="signup-btn" type="submit">Sign In</button>
                        </form>
                        <div className="signup">
                            <p>New User? <span onClick={handleSignupRedirect}>Create an Account</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;