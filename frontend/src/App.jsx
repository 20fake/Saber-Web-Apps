import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { HeartHandshake, LogOut, User } from 'lucide-react';
import Home from './pages/Home';
import ClientOrder from './pages/ClientOrder';
import DriverDashboard from './pages/DriverDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;

  return (
    <Router>
      <div className="min-h-screen">
        <nav className="navbar glass">
          <div className="container navbar-content">
            <Link to="/" className="brand">
              <HeartHandshake size={32} />
              <span>ChariDeliver</span>
            </Link>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <User size={18} /> {user.name} ({user.role})
                  </span>
                  {user.role === 'client' && <Link to="/client" className="btn btn-ghost">Request Food</Link>}
                  {user.role === 'partner' && <Link to="/driver" className="btn btn-primary">Driver Portal</Link>}
                  <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Login</Link>
                  <Link to="/register" className="btn btn-primary">Join Us</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="container animate-fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/client" element={user ? <ClientOrder /> : <Navigate to="/login" />} />
            <Route path="/driver" element={user ? <DriverDashboard /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
