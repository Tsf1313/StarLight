import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Check this path matches your folder structure

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Pull the login function from our new memory layer
  
  // State for our form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Call the database bridge via our context
    const result = await login(email, password);

    if (result.success) {
      // Success! Send them to the dashboard
      navigate('/dashboard');
    } else {
      // Fail! Show the error message from the backend
      setError(result.error || 'Failed to login. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#1e3a8a', color: 'white', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto 1rem' }}>E</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Login to manage your events</p>
        </div>

        {/* Dynamic Error Message Box */}
        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1.5rem', border: '1px solid #fecaca', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="scale-btn" 
            style={{ 
              background: isSubmitting ? '#94a3b8' : '#1e3a8a', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontWeight: 600, 
              marginTop: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
          <Link to="/" style={{ color: '#64748b' }}>&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}