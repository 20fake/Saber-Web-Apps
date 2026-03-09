import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigation, CheckCircle, Package, Clock, MapPin, Map as MapIcon } from 'lucide-react';
import LiveMap from '../components/LiveMap';

export default function DriverDashboard() {
    const [activeJob, setActiveJob] = useState(null);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [simulatedLocation, setSimulatedLocation] = useState({ lat: -6.2088, lng: 106.8456 }); // Jakarta

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/orders');
            setAvailableJobs(response.data.filter(job => job.status === 'pending'));

            const inProgress = response.data.find(job => ['confirmed', 'pickup', 'delivering'].includes(job.status));
            if (inProgress) setActiveJob(inProgress);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Simulate movement
    useEffect(() => {
        if (activeJob && activeJob.status === 'delivering') {
            const interval = setInterval(() => {
                setSimulatedLocation(prev => ({
                    lat: prev.lat + (Math.random() - 0.5) * 0.001,
                    lng: prev.lng + (Math.random() - 0.5) * 0.001
                }));
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [activeJob]);

    const acceptJob = async (id) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/orders/${id}`, { status: 'confirmed' });
            setActiveJob(response.data);
            fetchJobs();
        } catch (err) {
            alert('Failed to accept job');
        }
    };

    const updateStatus = async (status) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/orders/${activeJob.id}`, { status });
            setActiveJob(response.data);
            if (status === 'completed') {
                setActiveJob(null);
                fetchJobs();
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading jobs...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-h1 mb-2">Driver Dashboard</h1>
                    <p className="text-body text-muted">Manage your charity deliveries</p>
                </div>
                <div className="badge badge-success p-2">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-success)', marginRight: 8, display: 'inline-block' }} className="animate-pulse"></span>
                    Online & Ready
                </div>
            </div>

            <div className="md:grid-cols-3 gap-6">
                <div className="card md:col-span-1 h-full">
                    <h3 className="text-h3 mb-4 flex items-center gap-2"><Package size={20} /> Available Jobs</h3>
                    {availableJobs.map(job => (
                        <div key={job.id} className="card card-hover mb-4" style={{ padding: '1rem', backgroundColor: 'var(--color-background)' }}>
                            <h4 className="font-bold mb-1" style={{ fontSize: '1.125rem' }}>{job.client?.name || 'Anonymous Client'}</h4>
                            <p className="text-sm text-muted mb-2 flex items-center gap-1" style={{ fontSize: '0.875rem' }}><MapPin size={14} /> {job.delivery_location}</p>
                            <div className="flex justify-between items-center mb-3">
                                <span className="badge badge-pending">Pending</span>
                                <span className="text-sm text-muted flex items-center gap-1" style={{ fontSize: '0.875rem' }}><Clock size={14} /> Incoming</span>
                            </div>
                            <button
                                className="btn btn-outline w-full"
                                style={{ padding: '0.5rem' }}
                                onClick={() => acceptJob(job.id)}
                                disabled={activeJob !== null}
                            >
                                Accept Delivery
                            </button>
                        </div>
                    ))}
                    {availableJobs.length === 0 && <p className="text-muted text-center py-4">No pending jobs available.</p>}
                </div>

                <div className="card md:col-span-2 h-full flex-col">
                    {activeJob ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-h3 flex items-center gap-2">
                                    <Navigation size={20} color="var(--color-primary)" />
                                    {activeJob.status === 'confirmed' ? 'New Assignment' :
                                        activeJob.status === 'pickup' ? 'Heading to Kitchen' : 'Delivering to Client'}
                                </h3>
                                <span className="badge badge-info uppercase">Status: {activeJob.status}</span>
                            </div>

                            <div className="flex-1 min-h-[400px]">
                                <LiveMap
                                    orderId={activeJob.id}
                                    role="partner"
                                    simulatedPartnerLocation={simulatedLocation}
                                />
                            </div>

                            <div className="flex gap-4 p-4 glass mt-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm text-muted">Target Location</p>
                                    <p className="font-bold">{activeJob.delivery_location}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted">ETA</p>
                                    <p className="font-bold">{activeJob.status === 'delivering' ? '8 mins' : '--'}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                {activeJob.status === 'confirmed' && (
                                    <button className="btn btn-primary w-full" onClick={() => updateStatus('pickup')}>
                                        Mark as Picked Up
                                    </button>
                                )}
                                {activeJob.status === 'pickup' && (
                                    <button className="btn btn-primary w-full" onClick={() => updateStatus('delivering')}>
                                        Start Delivery Flow
                                    </button>
                                )}
                                {activeJob.status === 'delivering' && (
                                    <button className="btn btn-primary w-full" onClick={() => updateStatus('completed')}>
                                        <CheckCircle size={20} /> Complete Delivery
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[500px] flex items-center justify-center p-8 bg-surface-hover" style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            <div className="text-center">
                                <MapIcon size={64} color="var(--color-text-muted)" className="mx-auto mb-4" />
                                <h3 className="text-h3 text-muted mb-2">Navigation Inactive</h3>
                                <p className="text-body text-muted">Accept an available job to start the delivery process and enable real-time tracking.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
