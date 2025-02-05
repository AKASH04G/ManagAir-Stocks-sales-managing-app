import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './Api';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [popup, setPopup] = useState(null); // State for popup
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showPopup = (message, type) => {
        setPopup({ message, type });
        setTimeout(() => setPopup(null), 3000); // Auto-hide after 3 seconds
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/users/register', formData);
            showPopup('Signup successful!', 'success');
            setTimeout(() => navigate('/'), 1500); // Redirect after a short delay
        } catch (error) {
            showPopup('Signup failed. Please try again.', 'error');
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="login-page">
            {popup && (
                <div className={`popup ${popup.type}`} onClick={() => setPopup(null)}>
                    {popup.message}
                </div>
            )}

            <div className="left-section">
                <div className="app-title-container">
                    <h1 className="app-title">ManagAir: Bill & Stock</h1>
                </div>
                <div className="greeting-message">
                    <h1>New User,</h1>
                    <p>Create an account to manage your bills and stocks efficiently.</p>
                </div>
            </div>

            <div className="right-section">
                <div className="login-container">
                    <div className="login-form">
                        <h2>Signup</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button className="signup-btn" type="submit">Signup</button>
                        </form>
                        <div className="signup">
                            <p>Already a User? <span onClick={handleLoginRedirect}>Login</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
