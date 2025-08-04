import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const SignupForm = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Unexpected response from server');
      }

      if (res.ok) {
        setMessage('Signup successful!');
        setForm({ name: '', email: '', password: '' });
      } else {
        setMessage(data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="text-green-600" />
          <h1 className="text-lg font-semibold">Signup</h1>
        </div>
        <Link to="/users" className="flex items-center space-x-1 text-blue-600 hover:underline">
          <Users size={18} />
          <span>User List</span>
        </Link>
      </nav>

      <div className="flex justify-center items-center mt-12">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;