import React, { useState } from 'react';
import API from './Api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/users/login', formData);
            localStorage.setItem('token', data.token);
            alert('Login successful');
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    return (
        <div className="login-page">
            <div className="left-section">
                
                <div className="greeting-message">
                <div className="app-title-container">
                    <h1 className="app-title"> ManagAir: Bill & Stock</h1>
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
