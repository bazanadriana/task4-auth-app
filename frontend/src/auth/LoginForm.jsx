import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403 || res.status === 401) {
          localStorage.removeItem('token');
        }
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/users');
      } else {
        throw new Error('Token missing in response');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <LogIn className="text-blue-600" />
          <h1 className="text-lg font-semibold">Login</h1>
        </div>
        <Link to="/users" className="flex items-center space-x-1 text-blue-600 hover:underline">
          <Users size={18} />
          <span>User List</span>
        </Link>
      </nav>

      <div className="flex justify-center items-center mt-12">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              className="w-full px-4 py-2 border rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full px-4 py-2 border rounded"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
