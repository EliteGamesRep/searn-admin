// hooks/useAdminUsers.js
import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useNotification } from '../hooks/useNotification'

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      addNotification('🗑️ User deleted successfully!', 'success');
    } catch (err) {
      addNotification('❌ Failed to delete user', 'error');
    }
  };

  const updateUser = async (userId, updatedData) => {
    try {
      await api.put(`/admin/users/${userId}`, updatedData);
      setUsers(prev => prev.map(u => String(u._id) === String(userId) ? { ...u, ...updatedData } : u));
      addNotification('✅ User updated successfully!', 'success');
    } catch (err) {
      addNotification('❌ Failed to update user', 'error');
    }
  };

  return { users, loading, deleteUser, updateUser , refreshUsers: fetchUsers };
};
