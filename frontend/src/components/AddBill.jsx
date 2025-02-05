import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './Api'; // Configured Axios instance
import './AddBill.css';

const AddBill = () => {
    const [formData, setFormData] = useState({
        customerName: '',
        contact: '',
        items: [{ productId: '', description:'',name: '', quantity: 1, price: 0, total: 0 }],
        subTotal: 0,
        tax: 0,
        discount: 0,
        totalAmount: 0,
        paymentMethod: '',
    });

    const [shopInfo, setShopInfo] = useState({
        shopName: '',
        address: '',
        contact: ''
    });

    const [userId, setUserId] = useState('');
    const [showPopup, setShowPopup] = useState(null); // success or fail message
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) setUserId(storedUserId);

        const fetchShopInfo = async () => {
            try {
                const response = await API.get('/users/shopinfo');
                setShopInfo(response.data);
            } catch (error) {
                console.error('Error fetching shop info:', error.response?.data || error.message);
            }
        };

        fetchShopInfo();
    }, []);

    const calculateTotals = () => {
        const subTotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const tax = (parseFloat(formData.tax || 0)) * subTotal / 100;
        const discount = parseFloat(formData.discount || 0) * subTotal / 100;
        const totalAmount = subTotal + tax - discount;
        return { subTotal, totalAmount };
    };

    const handleInputChange = (e, index, field) => {
        if (field !== undefined) {
            const updatedItems = [...formData.items];
            updatedItems[index][field] = e.target.value;
            updatedItems[index].total =
                parseFloat(updatedItems[index].quantity || 0) * parseFloat(updatedItems[index].price || 0);
            setFormData({ ...formData, items: updatedItems });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', name: '', category: '', quantity: 1, price: 0, total: 0 }],
        });
    };

    useEffect(() => {
        const { subTotal, totalAmount } = calculateTotals();
        setFormData((prev) => ({ ...prev, subTotal, totalAmount }));
    }, [formData.items, formData.tax, formData.discount]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.customerName || !formData.contact) {
            setShowPopup({ type: 'fail', message: 'Please provide customer name and contact details.' });
            return;
        }
    
        if (formData.items.some((item) => !item.name || item.quantity <= 0 || item.price <= 0)) {
            setShowPopup({ type: 'fail', message: 'All items must have valid names, quantities, and prices.' });
            return;
        }
    
        try {
            await API.post('/sales/add', { ...formData, userId });
            setShowPopup({ type: 'success', message: 'Bill added successfully!' });
            
            // After 2 seconds, navigate to the sales list
            setTimeout(() => {
                navigate("/sales");
            }, 2000);
    
            // Reset form data
            setFormData({
                customerName: '',
                contact: '',
                items: [{ productId: '', description:'', name: '', quantity: 1, price: 0, total: 0 }],
                subTotal: 0,
                tax: 0,
                discount: 0,
                totalAmount: 0,
                paymentMethod: '',
            });
        } catch (error) {
            console.error('Error adding bill:', error.response?.data || error.message);
            setShowPopup({ type: 'fail', message: 'Failed to add bill. Please try again.' });
        }
    };
    

    return (
        <div className="bill-container">
            <div className="shop-info">
                <h2>{shopInfo.shopName}</h2>
                <p>{shopInfo.address}</p>
                <p>Contact: {shopInfo.phone}</p>
            </div>
            <form className="add-bill-form" onSubmit={handleSubmit}>
                <h3>Customer Details</h3>
                <div className="form-group">
                    <input
                        type="text"
                        name="customerName"
                        placeholder="Customer Name"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="contact"
                        placeholder="Contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <h4>Items</h4>
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleInputChange(e, index, 'description')}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleInputChange(e, index, 'name')}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleInputChange(e, index, 'quantity')}
                                        min="1"
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handleInputChange(e, index, 'price')}
                                        min="0"
                                        required
                                    />
                                </td>
                                <td>₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" className="add-item-btn" onClick={addItem}>
                    Add Item
                </button>
                <div className="totals">
    <table className="totals-table">
        <tbody>
            <tr>
                <td className="totals-label">Subtotal:</td>
                <td className="totals-value">₹{formData.subTotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td className="totals-label">Tax (in %):</td>
                <td>
                    <input
                        type="number"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        className="totals-input"
                    />
                </td>
            </tr>
            <tr>
                <td className="totals-label">Discount (in %):</td>
                <td>
                    <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        className="totals-input"
                    />
                </td>
            </tr>
            <tr>
                <td className="totals-label">Total Amount:</td>
                <td className="totals-value">₹{formData.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td className="totals-label">Payment Method:</td>
                <td>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="totals-input"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                    </select>
                </td>
            </tr>
        </tbody>
    </table>
</div>

                <div className="buttons">
                    <button type="submit" className="submit-btn">Submit</button>
                </div>
            </form>

            {/* Success/Fail Popup */}
            {showPopup && (
                <div className={`popup1 ${showPopup.type}`}>
                    <p>{showPopup.message}</p>
                </div>
            )}
        </div>
    );
};

export default AddBill;
