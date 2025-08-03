import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        console.warn(`Redirecting to login: status ${res.status}`);
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('Unexpected response format (not array):', data);
        setUsers([]); // fallback to empty list
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.status === 401 || res.status === 403) {
        console.warn(`Redirecting to login: status ${res.status}`);
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      await fetchUsers();
      setSelectedIds([]);
    } catch (err) {
      console.error(`❌ Failed to ${action} users:`, err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <NavigationHeader />
      <h2 className="text-xl font-bold mb-4">User List</h2>

      <div className="mb-4 space-x-2">
        <button onClick={() => handleAction('block')} className="bg-red-500 text-white px-4 py-1 rounded">Block</button>
        <button onClick={() => handleAction('unblock')} className="bg-green-500 text-white px-4 py-1 rounded">Unblock</button>
        <button onClick={() => handleAction('delete')} className="bg-gray-700 text-white px-4 py-1 rounded">Delete</button>
        <button onClick={handleSelectAll} className="ml-4 bg-blue-500 text-white px-3 py-1 rounded">
          {selectedIds.length === users.length ? 'Unselect All' : 'Select All'}
        </button>
      </div>

      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Select</th>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => handleSelect(u.id)}
                />
              </td>
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
