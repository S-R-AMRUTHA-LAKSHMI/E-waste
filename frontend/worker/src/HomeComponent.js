import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerificationDetails = ({ request, onBack, onUpdateStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState(request.amount || '');
    const [isPaid, setIsPaid] = useState(request.isPaid || false);
    const [isCollected, setIsCollected] = useState(request.isCollected || false);
    const [verificationResponses, setVerificationResponses] = useState(
        request.verificationResponses || {}
    );
    const [report, setReport] = useState(request.report || null);

    const verificationQuestions = [
        "Is the e-waste item matching the description provided?",
        "What is the condition of the e-waste?",
        "Are there any visible damages?",
        "Is the item complete with all parts?",
        "Does it contain any hazardous materials?",
        "Approximate weight of the item"
    ];

    const handleVerificationChange = (question, answer) => {
        setVerificationResponses(prev => ({
            ...prev,
            [question]: answer
        }));
    };

    const generateReport = () => {
        const newReport = {
            reportId: `REP-${request._id}-${Date.now()}`,
            verificationDate: new Date().toISOString(),
            customerDetails: {
                name: request.customerName,
                phone: request.phone,
                address: request.address,
                pickupDate: request.pickupDate,
                pickupTime: request.pickupTime
            },
            itemDetails: request.itemDetails,
            responses: verificationResponses,
            amount: amount,
            paymentStatus: isPaid ? 'Paid' : 'Pending',
            collectionStatus: isCollected ? 'Collected' : 'Pending'
        };
        setReport(newReport);
    };

    const handleStatusUpdate = async () => {
        const updates = {
            amount,
            isPaid,
            isCollected,
            verificationResponses,
            report
        };
        await onUpdateStatus(request._id, updates);
        setIsEditing(false);
    };

    const renderCustomerDetails = () => (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Name:</span> {request.customerName}</p>
                <p><span className="font-medium">Phone:</span> {request.phone}</p>
                <p><span className="font-medium">Address:</span> {request.address}</p>
                <p><span className="font-medium">Pickup:</span> {request.pickupDate} at {request.pickupTime}</p>
                <p><span className="font-medium">Item:</span> {request.itemDetails}</p>
            </div>
        </div>
    );

    const renderVerificationQuestions = () => (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Verification Questions</h2>
            {verificationQuestions.map((question, index) => (
                <div key={index} className="mb-4">
                    <label className="block mb-2">{question}</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        onChange={(e) => handleVerificationChange(question, e.target.value)}
                        value={verificationResponses[question] || ''}
                    />
                </div>
            ))}
            <button
                onClick={generateReport}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mb-4"
            >
                Generate Report
            </button>
        </div>
    );

    const renderReport = () => (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Generated Report</h2>
                {request.status === 'completed' && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Edit Details
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <p><span className="font-medium">Report ID:</span> {report.reportId}</p>
                <p><span className="font-medium">Verification Date:</span> {new Date(report.verificationDate).toLocaleString()}</p>
                
                <h3 className="font-semibold mt-4">Verification Responses:</h3>
                {Object.entries(report.responses).map(([question, answer], index) => (
                    <div key={index} className="ml-4">
                        <p className="font-medium">{question}</p>
                        <p className="text-gray-600">{answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPaymentCollection = (isEditMode) => (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Payment and Collection</h2>
            {isEditMode ? (
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2">Amount (in currency)</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={isPaid}
                                onChange={(e) => setIsPaid(e.target.checked)}
                            />
                            Payment Provided
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={isCollected}
                                onChange={(e) => setIsCollected(e.target.checked)}
                            />
                            E-Waste Collected
                        </label>
                    </div>

                    <button
                        onClick={handleStatusUpdate}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Update Details
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p><span className="font-medium">Amount:</span> ${amount}</p>
                    <p><span className="font-medium">Payment Status:</span> {isPaid ? 'Paid' : 'Pending'}</p>
                    <p><span className="font-medium">Collection Status:</span> {isCollected ? 'Collected' : 'Pending'}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-4 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    ← Back to Home
                </button>
            </div>

            {renderCustomerDetails()}
            
            {request.status === 'completed' ? (
                isEditing ? (
                    <>
                        {renderVerificationQuestions()}
                        {renderPaymentCollection(true)}
                    </>
                ) : (
                    <>
                        {report && renderReport()}
                        {renderPaymentCollection(false)}
                    </>
                )
            ) : (
                <>
                    {renderVerificationQuestions()}
                    {renderPaymentCollection(true)}
                </>
            )}
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