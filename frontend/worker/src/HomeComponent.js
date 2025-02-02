import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import "./HomeComponent.css";

const VerificationDetails = ({ request, onBack, onUpdateStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [predictionData, setPredictionData] = useState({
        itemType: '',
        brand: '',
        age: '',
        condition: '',
        weight: '',
        materialComposition: '',
        batteryIncluded: '',
        visibleDamage: '',
        screenCondition: '',
        rustPresence: '',
        wiringCondition: '',
        resalePotential: ''
    });
    const [amount, setAmount] = useState(request.amount || '');
    const [isPaid, setIsPaid] = useState(request.isPaid || false);
    const [isCollected, setIsCollected] = useState(request.isCollected || false);
    const [loading, setLoading] = useState(false);
    const [predictionResult, setPredictionResult] = useState(null);

    const handlePredictionChange = (field, value) => {
        setPredictionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getPrediction = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(predictionData),
            });
            const data = await response.json();
            setPredictionResult(data);
            setAmount(data.finalAmount.toFixed(2));
        } catch (error) {
            console.error('Prediction error:', error);
        }
        setLoading(false);
    };

    const handleStatusUpdate = async () => {
        const updates = {
            amount,
            isPaid,
            isCollected,
            predictionData,
            predictionResult
        };
        await onUpdateStatus(request._id, updates);
        setIsEditing(false);
    };

    const renderCustomerDetails = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold">Name:</p>
                    <p>{request.customerName}</p>
                </div>
                <div>
                    <p className="font-semibold">Phone:</p>
                    <p>{request.phone}</p>
                </div>
                <div>
                    <p className="font-semibold">Address:</p>
                    <p>{request.address}</p>
                </div>
                <div>
                    <p className="font-semibold">Pickup Details:</p>
                    <p>{request.pickupDate} at {request.pickupTime}</p>
                </div>
                <div className="col-span-2">
                    <p className="font-semibold">Item Details:</p>
                    <p>{request.itemDetails}</p>
                </div>
            </div>
        </div>
    );

    const renderReport = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Verification Report</h2>
            <div className="space-y-4">
                <div>
                    <p className="font-semibold">Report ID:</p>
                    <p>{request.report?.reportId}</p>
                </div>
                <div>
                    <p className="font-semibold">Verification Date:</p>
                    <p>{new Date(request.report?.verificationDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="font-semibold">Final Amount:</p>
                    <p>₹{request.report?.predictionDetails?.finalAmount?.toFixed(2)}</p>
                </div>
                <div>
                    <p className="font-semibold">Status:</p>
                    <p>Payment: {request.report?.paymentStatus}</p>
                    <p>Collection: {request.report?.collectionStatus}</p>
                </div>
            </div>
        </div>
    );

    const renderPaymentCollection = (isEditable) => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment & Collection Status</h2>
            <div className="space-y-4">
                <div>
                    <p className="font-semibold">Amount:</p>
                    <p>₹{amount}</p>
                </div>
                {isEditable ? (
                    <>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isPaid}
                                onChange={(e) => setIsPaid(e.target.checked)}
                                className="h-4 w-4 text-indigo-600"
                            />
                            <label>Payment Received</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isCollected}
                                onChange={(e) => setIsCollected(e.target.checked)}
                                className="h-4 w-4 text-indigo-600"
                            />
                            <label>Item Collected</label>
                        </div>
                        <button
                            onClick={handleStatusUpdate}
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Update Status
                        </button>
                    </>
                ) : (
                    <>
                        <p>Payment Status: {isPaid ? 'Paid' : 'Pending'}</p>
                        <p>Collection Status: {isCollected ? 'Collected' : 'Pending'}</p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Edit Status
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    const renderPredictionForm = () => {
        const getBrandOptions = (itemType) => {
            switch (itemType) {
                case 'Laptop':
                    return ['Dell', 'HP', 'Lenovo', 'Apple', 'Acer'];
                case 'Mobile':
                    return ['Samsung', 'Apple', 'OnePlus', 'Vivo', 'Oppo'];
                case 'TV':
                    return ['Sony', 'LG', 'Samsung', 'Panasonic'];
                case 'Refrigerator':
                    return ['LG', 'Samsung', 'Whirlpool', 'Godrej'];
                case 'Washing Machine':
                    return ['IFB', 'Bosch', 'LG', 'Samsung'];
                case 'Microwave':
                    return ['Samsung', 'LG', 'Panasonic'];
                case 'Printer':
                    return ['HP', 'Epson', 'Canon'];
                case 'AC':
                    return ['Voltas', 'LG', 'Hitachi', 'Daikin'];
                default:
                    return [];
            }
        };
    
        return (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">E-Waste Assessment</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Item Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.itemType}
                            onChange={(e) => {
                                handlePredictionChange('itemType', e.target.value);
                                handlePredictionChange('brand', ''); // Reset brand when item type changes
                            }}
                        >
                            <option value="">Select Item Type</option>
                            {['Laptop', 'Mobile', 'TV', 'Refrigerator', 'Washing Machine', 'Microwave', 'Printer', 'AC']
                                .map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Brand</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.brand}
                            onChange={(e) => handlePredictionChange('brand', e.target.value)}
                            disabled={!predictionData.itemType}
                        >
                            <option value="">Select Brand</option>
                            {getBrandOptions(predictionData.itemType).map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Age (Years)</label>
                        <input
                            type="number"
                            min="1"
                            max="15"
                            className="w-full p-2 border rounded"
                            value={predictionData.age}
                            onChange={(e) => handlePredictionChange('age', e.target.value)}
                        />
                    </div>
    
                    <div>
                        <label className="block mb-2">Condition</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.condition}
                            onChange={(e) => handlePredictionChange('condition', e.target.value)}
                        >
                            <option value="">Select Condition</option>
                            <option value="Working">Working (Fully functional)</option>
                            <option value="Partially Working">Partially Working (Some issues, repairable)</option>
                            <option value="Non-Working">Non-Working (Not working but repairable)</option>
                            <option value="Scrap">Scrap (Only useful for materials)</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="60"
                            className="w-full p-2 border rounded"
                            value={predictionData.weight}
                            onChange={(e) => handlePredictionChange('weight', e.target.value)}
                        />
                    </div>
    
                    <div>
                        <label className="block mb-2">Material Composition</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.materialComposition}
                            onChange={(e) => handlePredictionChange('materialComposition', e.target.value)}
                        >
                            <option value="">Select Material Composition</option>
                            <option value="Plastic, Metal">Plastic, Metal</option>
                            <option value="Glass, Plastic, Metal">Glass, Plastic, Metal</option>
                            <option value="Metal, Plastic">Metal, Plastic</option>
                            <option value="Plastic, Glass">Plastic, Glass</option>
                            <option value="Plastic">Plastic</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Battery Included</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.batteryIncluded}
                            onChange={(e) => handlePredictionChange('batteryIncluded', e.target.value)}
                        >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Visible Damage</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.visibleDamage}
                            onChange={(e) => handlePredictionChange('visibleDamage', e.target.value)}
                        >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Screen Condition</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.screenCondition}
                            onChange={(e) => handlePredictionChange('screenCondition', e.target.value)}
                            disabled={!['Laptop', 'Mobile', 'TV'].includes(predictionData.itemType)}
                        >
                            <option value="">Select Screen Condition</option>
                            <option value="No Damage">No Damage</option>
                            <option value="Minor Scratches">Minor Scratches</option>
                            <option value="Cracked">Cracked</option>
                            <option value="Missing Parts">Missing Parts</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Rust Presence</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.rustPresence}
                            onChange={(e) => handlePredictionChange('rustPresence', e.target.value)}
                        >
                            <option value="">Select Option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Wiring Condition</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.wiringCondition}
                            onChange={(e) => handlePredictionChange('wiringCondition', e.target.value)}
                        >
                            <option value="">Select Wiring Condition</option>
                            <option value="Intact">Intact (No visible damage)</option>
                            <option value="Slightly Worn">Slightly Worn</option>
                            <option value="Damaged Wires">Damaged Wires</option>
                        </select>
                    </div>
    
                    <div>
                        <label className="block mb-2">Resale Potential</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={predictionData.resalePotential}
                            onChange={(e) => handlePredictionChange('resalePotential', e.target.value)}
                        >
                            <option value="">Select Resale Potential</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={getPrediction}
                    disabled={loading}
                    className="w-full mt-6 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {loading ? 'Calculating...' : 'Calculate Price'}
                </button>
    
                {predictionResult && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="font-bold mb-2">Assessment Results:</h3>
                        <p>Scrap Price: ₹{predictionResult.scrapPrice.toFixed(2)}</p>
                        <p>Repair Cost: ₹{predictionResult.repairCost.toFixed(2)}</p>
                        <p className="font-bold">Final Amount: ₹{predictionResult.finalAmount.toFixed(2)}</p>
                    </div>
                )}
            </div>
        );
    };
    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={onBack}
                className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                ← Back
            </button>
            {renderCustomerDetails()}
            {renderPredictionForm()}
            {renderPaymentCollection(isEditing)}
            {request.report && renderReport()}
        </div>
    );
};



// Main Home Component
const HomeComponent = () => {
    const [userData, setUserData] = useState(null);
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

   // In HomeComponent.js
useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        navigate('/login');
        return;
    }
    
    try {
        const parsedUser = JSON.parse(userStr);
        if (!parsedUser.id) {
            // If no ID, redirect to login
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }
        
        setUserData(parsedUser);

        const fetchRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/requests/${parsedUser.id}`);
                setRequests(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError('Failed to fetch requests');
                setLoading(false);
            }
        };

        fetchRequests();
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        navigate('/login');
    }
}, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUpdateStatus = async (requestId, updates) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/requests/${requestId}`, updates);
            setRequests(prev =>
                prev.map(req =>
                    req._id === requestId ? response.data : req
                )
            );
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error updating request:', error);
            // You might want to show an error message to the user here
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'verified': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (!userData) return null;
    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

    if (selectedRequest) {
        return (
            <VerificationDetails
                request={selectedRequest}
                onBack={() => setSelectedRequest(null)}
                onUpdateStatus={handleUpdateStatus}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                E-Waste Verification Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">
                                Collector: {userData.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Assigned Requests
                        </h2>
                        {requests.length === 0 ? (
                            <p className="text-gray-600">No requests assigned yet.</p>
                        ) : (
                            requests.map(request => (
                                <div key={request._id} className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">{request.customerName}</h3>
                                            <p className="text-gray-600">{request.phone}</p>
                                            <p className="text-gray-600">{request.itemDetails}</p>
                                            <p className="text-sm text-gray-500">
                                                {request.pickupDate} at {request.pickupTime}
                                            </p>
                                            {request.amount && (
                                                <p className="text-sm text-gray-500">
                                                    Amount: ${request.amount}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomeComponent;