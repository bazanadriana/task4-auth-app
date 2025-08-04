import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "../common/NavigationHeader";

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const currentUserId = parseInt(localStorage.getItem("userId"), 10);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action) => {
    if (selectedIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/users/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (selectedIds.includes(currentUserId)) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } else {
        fetchUsers();
        setSelectedIds([]);
        setSelectAll(false);
      }
    } catch (err) {
      console.error(`Failed to ${action} users`, err);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      const allIds = users.map((u) => u.id);
      setSelectedIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "text-green-600";
    if (status === "Blocked") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-16">
      <NavigationHeader />
      <div className="flex flex-col items-center mt-8 px-4">
        <div className="flex space-x-4 mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => handleAction("block")}
          >
            Block
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => handleAction("unblock")}
          >
            Unblock
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={() => handleAction("delete")}
          >
            Delete
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg w-full max-w-4xl">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelect(user.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className={`px-4 py-2 font-semibold ${getStatusColor(user.status)}`}>
                    {user.status}
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
    </div>
  );
}

export default UserList;