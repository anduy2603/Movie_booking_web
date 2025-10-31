import React, { useState, useEffect } from 'react';
import { userService } from '../services';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, UserCheck, UserX } from 'lucide-react';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsersRequest(page);
      setUsers(response.data?.data || []);
      setTotalPages(response.data?.pages || Math.ceil((response.data?.total || 0) / 10));
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      await userService.updateUserRequest(userId, { is_active: isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    const target = users.find(u => u.id === userId)
    if (target?.role === 'admin') {
      toast.error('Cannot delete admin accounts')
      return
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUserRequest(userId);
        toast.success('User deleted (deactivated) successfully');
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        const msg = error?.response?.data?.detail || error?.message || 'Failed to delete user'
        toast.error(msg)
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">User Management</h1>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.full_name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-center">
                  <button
                    onClick={() => handleStatusChange(user.id, !user.is_active)}
                    className={`text-${user.is_active ? 'yellow' : 'green'}-400 hover:text-${user.is_active ? 'yellow' : 'green'}-300 mx-2`}
                  >
                    {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-300 mx-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUserList;