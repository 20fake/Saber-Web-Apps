import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function Register({ setUser }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/register', formData);
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setUser(user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
            <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="text-center mb-6">
                    <UserPlus size={48} color="var(--color-primary)" className="mx-auto mb-2" />
                    <h2 className="text-h2">Create Account</h2>
                    <p className="text-muted">Start your journey with ChariDeliver</p>
                </div>

                {error && <div className="badge badge-pending w-full mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
                            <option value="client">Client (Need Assistance)</option>
                            <option value="partner">Volunteer (Driver)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            name="password"
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            name="password_confirmation"
                            type="password"
                            className="form-input"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-muted">
                    Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
}
