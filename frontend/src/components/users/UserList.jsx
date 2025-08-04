import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.userId);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err.message);
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      const nonCurrentIds = users.filter(u => u.id !== currentUserId).map(u => u.id);
      setSelectedIds(nonCurrentIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const sendAction = async (endpoint) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      await fetchUsers();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error(`Failed to ${endpoint} users:`, err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <NavigationHeader />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center space-x-2 py-4">
          <button
            onClick={() => sendAction('block')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          >
            Block
          </button>
          <button
            onClick={() => sendAction('unblock')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
          >
            Unblock
          </button>
          <button
            onClick={() => sendAction('delete')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
          >
            Delete
          </button>
        </div>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isSelected = selectedIds.includes(user.id);
                const isCurrent = user.id === currentUserId;

                return (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {!isCurrent && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(user.id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">{user.name || 'N/A'}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 font-semibold text-sm" style={{ color: getStatusColor(user.status) }}>
                      {user.status}
                    </td>
                    <td className="px-4 py-2">{formatDate(user.last_login)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
}

function getStatusColor(status) {
  if (status === 'Active') return 'green';
  if (status === 'Blocked') return 'orange';
  return 'red';
}

export default UserList;