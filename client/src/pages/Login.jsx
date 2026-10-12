import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Logged in successfully');
        navigate('/');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Registered successfully');
        navigate('/');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server on port 5000. Please ensure server is running.'
          : error.message) ||
        'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    setFormData({ name: 'Demo User', email: 'demo@codescope.io', password: 'password123' });
    setIsLogin(true);
    setLoading(true);
    try {
      await login('demo@codescope.io', 'password123');
      toast.success('Logged in with Demo Account');
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Demo login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ height: '100vh' }}>
      <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
        <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
          CodeScope
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem', 
              marginTop: '0.5rem', 
              background: 'var(--primary)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={handleDemoFill}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            ⚡ Quick Demo Login (demo@codescope.io)
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: '', email: '', password: '' });
            }} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
