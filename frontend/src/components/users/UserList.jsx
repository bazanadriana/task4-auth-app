import React, { useEffect, useState } from 'react';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAction = async (action) => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch(`${API_URL}/users/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      await fetchUsers();
      setSelectedIds([]);
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 font-medium';
      case 'Blocked':
        return 'text-yellow-600 font-medium';
      case 'Deleted':
        return 'text-red-600 font-medium';
      default:
        return '';
    }
  };

  return (
    <>
      <NavigationHeader />
      <div className="pt-20 px-6">
        <div className="flex space-x-2 mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            onClick={() => handleAction('block')}
          >
            Block
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            onClick={() => handleAction('unblock')}
          >
            Unblock
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
            onClick={() => handleAction('delete')}
          >
            Delete
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === users.length && users.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(users.map((u) => u.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{user.name || '—'}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={getStatusClass(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(user.last_login).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserList;