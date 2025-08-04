import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const updateUserStatus = async (action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      if (res.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      await fetchUsers();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationHeader />
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => updateUserStatus('block')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Block
          </button>
          <button
            onClick={() => updateUserStatus('delete')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-2 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelectOne(user.id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-900">{user.name}</td>
                    <td className="px-4 py-2 text-gray-900">{user.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`font-medium ${
                          user.status === 'active'
                            ? 'text-green-600'
                            : user.status === 'blocked'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {user.last_login ? formatDateTime(user.last_login) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserList;