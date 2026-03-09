import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, MapPin, Send, HeartHandshake, CheckCircle, Package, Truck } from 'lucide-react';
import LiveMap from '../components/LiveMap';

export default function ClientOrder() {
    const [loading, setLoading] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [formData, setFormData] = useState({
        pickup_location: 'Central Charity Kitchen',
        delivery_location: '',
        details: ''
    });
    const [idFile, setIdFile] = useState(null);
    const [isVerified, setIsVerified] = useState(false);

    const [activeTab, setActiveTab] = useState('request'); // 'request' or 'history'
    const [pastOrders, setPastOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
        // Check verification status from user profile
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.is_verified) setIsVerified(true);
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/orders');
            const orders = response.data;

            // Find active (not completed or cancelled)
            const active = orders.find(o => o.status !== 'completed' && o.status !== 'cancelled');
            setActiveOrder(active);

            // Set past orders
            setPastOrders(orders.filter(o => o.status === 'completed' || o.status === 'cancelled'));

            // If there's an active order, default to showing it
            if (active && activeTab === 'request') {
                setActiveTab('active');
            }
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleIdUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('id_image', file);

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/verify-id', uploadData);
            if (response.data.is_verified) {
                setIsVerified(true);
                // Update local user object
                const user = JSON.parse(localStorage.getItem('user'));
                user.is_verified = true;
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVerified) {
            alert('Please verify your ID first.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/orders', formData);
            setActiveOrder(response.data);
            setActiveTab('active');
            fetchOrders();
        } catch (err) {
            alert('Failed to submit order');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        try {
            await axios.put(`http://localhost:8000/api/orders/${activeOrder.id}`, { status });
            if (status === 'completed') {
                setActiveOrder(null);
                setActiveTab('history');
                fetchOrders();
                alert('Thank you for confirming! We hope you enjoy your meal.');
            } else {
                fetchOrders();
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const cancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel?')) return;
        try {
            await axios.put(`http://localhost:8000/api/orders/${activeOrder.id}`, { status: 'cancelled' });
            setActiveOrder(null);
            fetchOrders();
            setActiveTab('history');
        } catch (err) {
            alert('Failed to cancel');
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // In a real app, we would use reverse geocoding to get a human-readable address.
                // For now, we'll use the coordinates as a temporary address.
                setFormData({ ...formData, delivery_location: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` });
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching location:', error);
                alert('Unable to retrieve your location. Please check your browser permissions.');
                setLoading(false);
            }
        );
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Tabs Navigation */}
            <div className="flex gap-4 mb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <button
                    onClick={() => setActiveTab('request')}
                    className={`p-4 font-semibold transition-all ${activeTab === 'request' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
                    style={{ borderBottomWidth: activeTab === 'request' ? '2px' : '0' }}
                >
                    New Request
                </button>
                {activeOrder && (
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`p-4 font-semibold transition-all ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
                        style={{ borderBottomWidth: activeTab === 'active' ? '2px' : '0' }}
                    >
                        Active Tracking
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('history')}
                    className={`p-4 font-semibold transition-all ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
                    style={{ borderBottomWidth: activeTab === 'history' ? '2px' : '0' }}
                >
                    Order History
                </button>
            </div>

            {/* Active Tracking View */}
            {activeTab === 'active' && activeOrder && (
                <div className="animate-fade-in">
                    <div className="card mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-h2 mb-1">Order #{activeOrder.id}</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${['pending', 'confirmed'].includes(activeOrder.status) ? 'badge-pending' : 'badge-success'}`}>
                                        {activeOrder.status.toUpperCase()}
                                    </span>
                                    <span className="text-sm text-muted">Placed on {new Date(activeOrder.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {activeOrder.status === 'pending' && (
                                <button onClick={cancelOrder} className="btn btn-ghost text-error">Cancel Request</button>
                            )}
                            {activeOrder.status === 'delivering' && (
                                <button onClick={() => updateStatus('completed')} className="btn btn-primary">Confirm Receipt</button>
                            )}
                        </div>

                        <div className="md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-h3 mb-4 flex items-center gap-2"><Package size={20} /> Delivery Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted">Pickup Point</p>
                                        <p className="font-medium">{activeOrder.pickup_location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted">Your Address</p>
                                        <p className="font-medium">{activeOrder.delivery_location}</p>
                                    </div>
                                    {activeOrder.partner && (
                                        <div className="p-4 glass rounded-lg">
                                            <p className="text-sm text-muted">Your Hero (Driver)</p>
                                            <p className="font-bold text-lg">{activeOrder.partner.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="min-h-[300px] flex flex-col">
                                <h3 className="text-h3 mb-4 flex items-center gap-2"><Truck size={20} /> Live Tracking</h3>
                                <div className="flex-1">
                                    <LiveMap orderId={activeOrder.id} role="client" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request View */}
            {activeTab === 'request' && (
                <div className="animate-fade-in">
                    <div className="mb-8">
                        <h1 className="text-h1 mb-2">Request Food Assistance</h1>
                        <p className="text-body text-muted">Fill out the details below so our volunteer network can deliver a meal to you.</p>
                    </div>

                    <div className="md:grid-cols-2">
                        <div className="card">
                            <h3 className="text-h3 mb-4">Delivery Details</h3>
                            {!isVerified ? (
                                <div className="p-6 text-center bg-surface-hover rounded-lg border-dashed border-2 border-border mb-6">
                                    <Camera size={48} className="mx-auto mb-4 text-muted" />
                                    <h4 className="font-bold mb-2">ID Verification Required</h4>
                                    <p className="text-sm text-muted mb-4">To ensure help reaches those in need fairly, we require a one-time ID verification.</p>
                                    <input
                                        type="file"
                                        id="id-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleIdUpload}
                                        disabled={loading}
                                    />
                                    <label htmlFor="id-upload" className="btn btn-primary cursor-pointer">
                                        {loading ? 'Processing...' : 'Upload ID Photo'}
                                    </label>
                                </div>
                            ) : (
                                <div className="badge badge-success mb-6 w-full py-2 flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Identity Verified
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Delivery Address</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="123 Hope St, Apt 4"
                                            required
                                            value={formData.delivery_location}
                                            onChange={e => setFormData({ ...formData, delivery_location: e.target.value })}
                                            disabled={!isVerified}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            style={{ padding: '0.75rem' }}
                                            disabled={!isVerified || loading}
                                            onClick={handleUseCurrentLocation}
                                            title="Use my current location"
                                        >
                                            <MapPin size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes for Driver</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        placeholder="e.g. Leave at front door..."
                                        value={formData.details}
                                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                                        disabled={!isVerified}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading || !isVerified}>
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send size={20} /> Send Request
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="card bg-surface-hover flex-col justify-center text-center p-8 h-full" style={{ alignSelf: 'start', position: 'sticky', top: '100px' }}>
                            <HeartHandshake size={64} className="mb-6 mx-auto" color="var(--color-secondary)" style={{ margin: '0 auto 1.5rem' }} />
                            <h3 className="text-h3">Community Spirit</h3>
                            <p className="text-body text-muted mb-4">ChariDeliver handles over 500 meals weekly thanks to donors and volunteers like you.</p>
                            <div className="text-left space-y-3 mt-4">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">1</div>
                                    <p className="text-sm">Verify your identity once</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">2</div>
                                    <p className="text-sm">Submit your delivery address</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">3</div>
                                    <p className="text-sm">Track your hero in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History View */}
            {activeTab === 'history' && (
                <div className="animate-fade-in">
                    <h2 className="text-h2 mb-6">Past Orders</h2>
                    {pastOrders.length === 0 ? (
                        <div className="card text-center p-12 bg-surface-hover">
                            <p className="text-muted">You haven't made any requests yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pastOrders.map(order => (
                                <div key={order.id} className="card flex justify-between items-center card-hover">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold">Order #{order.id}</h4>
                                            <span className={`badge ${order.status === 'completed' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted flex items-center gap-1"><MapPin size={12} /> {order.delivery_location}</p>
                                        <p className="text-xs text-muted mt-1">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        {order.partner && (
                                            <p className="text-sm">Delivered by <strong>{order.partner.name}</strong></p>
                                        )}
                                        <p className="text-xs text-muted">ID: {order.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
