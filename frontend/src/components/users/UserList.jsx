import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../common/NavigationHeader';

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403 || res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = users.map((u) => u.id);
    setSelectedIds(allIds);
  };

  const clearSelection = () => setSelectedIds([]);

  const performAction = async (action) => {
    if (selectedIds.length === 0) return;

    const token = localStorage.getItem('token');
    const endpoint = action === 'block'
      ? 'block'
      : action === 'unblock'
      ? 'unblock'
      : 'delete';

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
      clearSelection();
    } catch (err) {
      console.error(`❌ Failed to ${action} users:`, err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User List</h2>
          <div className="space-x-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Clear
            </button>
            <button
              onClick={() => performAction('block')}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Block
            </button>
            <button
              onClick={() => performAction('unblock')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Unblock
            </button>
            <button
              onClick={() => performAction('delete')}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Select</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(user.id)}
                      />
                    </td>
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">
                      <span
                        className={
                          user.status === 'Deleted'
                            ? 'text-red-600 font-semibold'
                            : user.status === 'Blocked'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-green-600 font-semibold'
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-2 border text-sm text-gray-600">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : 'Never'}
                    </td>
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

export default UserList;