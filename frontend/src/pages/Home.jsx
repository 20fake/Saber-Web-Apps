import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Truck, MapPin, Clock } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex-col items-center justify-center text-center mt-8">
            <div className="mb-8 p-8 glass" style={{ borderRadius: 'var(--radius-xl)' }}>
                <HeartHandshake className="mb-4" size={64} color="var(--color-primary)" style={{ margin: '0 auto' }} />
                <h1 className="text-h1">Delivering Hope & Meals</h1>
                <p className="text-body text-muted mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Connect with dedicated volunteers who deliver nutritious meals to those in need. Join our community as a client requesting food, or as a partner driver helping your neighborhood.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/client" className="btn btn-primary">Request a Meal</Link>
                    <Link to="/driver" className="btn btn-outline">Become a Driver</Link>
                </div>
            </div>

            <div className="md:grid-cols-3 mt-8 text-left">
                <div className="card">
                    <MapPin size={32} className="mb-4" color="var(--color-secondary)" />
                    <h3 className="text-h3">Real-time Tracking</h3>
                    <p className="text-body text-muted">Know exactly when your meal will arrive with live map tracking and reliable ETAs.</p>
                </div>
                <div className="card">
                    <Truck size={32} className="mb-4" color="var(--color-primary)" />
                    <h3 className="text-h3">Fast Delivery</h3>
                    <p className="text-body text-muted">Our dedicated network of volunteers ensures food is delivered promptly and safely.</p>
                </div>
                <div className="card">
                    <Clock size={32} className="mb-4" color="var(--color-secondary)" />
                    <h3 className="text-h3">Easy Requests</h3>
                    <p className="text-body text-muted">A streamlined process to request help whenever you need it most, with just a few clicks.</p>
                </div>
            </div>
        </div>
    );
}
