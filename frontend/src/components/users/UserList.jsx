import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 403 || res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          const data = await res.json();
          setUsers(data.users);
          setCurrentUserId(data.currentUserId);
        }
      })
      .catch((err) => {
        console.error('❌ Failed to fetch users:', err);
      });
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const ids = users.map((user) => user.id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    if (!token || selectedIds.length === 0) return;

    const res = await fetch(`${API_URL}/api/users/${action}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (res.status === 403 || res.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      const data = await res.json();
      setUsers(data.users);
      setSelectedIds([]);

      if (data.loggedOut) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const isAllSelected = selectedIds.length > 0 && selectedIds.length === users.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationHeader />

      <div className="max-w-6xl mx-auto p-6">
        {/* Toolbar */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleAction('block')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            Block
          </button>
          <button
            onClick={() => handleAction('delete')}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            Delete
          </button>
        </div>

        <table className="w-full bg-white shadow rounded-lg overflow-hidden text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              const isSelf = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(user.id)}
                    />
                  </td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-green-600 font-semibold">
                    {user.is_deleted
                      ? 'Deleted'
                      : user.is_blocked
                      ? 'Blocked'
                      : 'Active'}
                  </td>
                  <td className="p-3">{formatLastLogin(user.last_login)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
