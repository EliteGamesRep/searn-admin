import React, { createContext, useContext, useCallback, useMemo, useState , useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from '../hooks/useNotification';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import api from '../utils/axios';


export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage(LOCAL_STORAGE_KEYS.USER, null);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const [merchants, setMerchants] = React.useState([]);

  const [transactions, setTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // ✅ LOGIN

  useEffect(() => {
     if (!user) return;
    const fetchMerchants = async () => {
      try {
        const response = await api.get('/merchants'); 
        setMerchants(response.data);
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
      }
    };

    fetchMerchants();
  }, [user]);


  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);  // backend filters if not super admin
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchActivityLogs = useCallback(async () => {
    try {
      const res = await api.get('/admin/activity-logs');
      setActivityLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setActivityLogs([]);
      return;
    }

    if (!['super_admin', 'super_manager', 'store_admin'].includes(user.role)) {
      setActivityLogs([]);
      return;
    }

    fetchActivityLogs();
  }, [user, fetchActivityLogs]);


  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      setUser(user);

      addNotification('🎮 Welcome to Gaming Admin Portal!', 'success');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      addNotification('❌ Invalid email or password', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, addNotification]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    setUser(null);
    addNotification('👋 Successfully logged out!', 'success');
  }, [setUser, addNotification]);

  // ✅ MERCHANT CRUD (hit real backend)
  const addMerchant = useCallback(async (merchant) => {
    const res = await api.post('/merchants', merchant);
    setMerchants(prev => [...prev, res.data]);
    addNotification('🎉 Gaming hub added successfully!', 'success');
  }, [setMerchants, addNotification]);

  const updateMerchant = useCallback(async (id, updatedMerchant) => {
    await api.put(`/merchants/${id}`, updatedMerchant); // backend must support this
    setMerchants(prev => prev.map(m => m._id === id ? { ...m, ...updatedMerchant } : m));
    addNotification('✅ Gaming hub updated successfully!', 'success');
  }, [setMerchants, addNotification]);

  const deleteMerchant = useCallback(async (id) => {
    await api.delete(`/merchants/${id}`);
    setMerchants(prev => prev.filter(m => m._id !== id));
    addNotification('🗑️ Gaming hub deleted successfully!', 'success');
  }, [setMerchants, addNotification]);

  // ✅ USER ADD (Manager/Cashier)
  const addUser = useCallback(async (newUser) => {
    await api.post('/admin/users', newUser);
    addNotification('👤 User added successfully!', 'success');
  }, [addNotification]);

  const getUserMerchant = useCallback(() => {
    if (!user || user.role === 'super_admin') return null;
    return merchants.find(m => m._id === user.merchantId);
  }, [user, merchants]);

  const getFilteredTransactions = useCallback(() => {
    if (!user) return [];
      return transactions
    // if (user.role === 'super_admin') return transactions;
    // return transactions.filter(t => t.merchantId === user.merchantId);
  }, [user, transactions]);

  const toggleDisabled = useCallback(async (merchant) => {
    await api.put(`/merchants/${merchant._id}/disabled`, {
      disabled: !merchant.disabled,
    });
    setMerchants(prev =>
      prev.map(m => m._id === merchant._id ? { ...m, disabled: !merchant.disabled } : m)
    );
    addNotification(
      `Merchant ${!merchant.disabled ? 'disabled' : 'enabled'} successfully`,
      'success'
    );
  }, [setMerchants, addNotification]);

  const changePassword = useCallback(async (merchant) => {
    const newPassword = prompt(`Enter new password for ${merchant.name}:`);
    if (!newPassword) return;

    await api.put(`/merchants/${merchant._id}/change-password`, {
      newPassword,
    });
    addNotification('Password updated successfully!', 'success');
  }, [addNotification]);

  const toggleWithdrawals = useCallback(async (merchantId, enabled) => {
    const { data } = await api.patch(`/merchants/${merchantId}/withdrawals`, {
      withdrawalsEnabled: enabled,
    });
    setMerchants(prev => prev.map(m => (
      m._id === merchantId ? { ...m, withdrawalsEnabled: data?.withdrawalsEnabled ?? enabled } : m
    )));
    addNotification(`Withdrawals ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
  }, [setMerchants, addNotification]);

  const changeUserPassword = useCallback(async (userId, newPassword) => {
    await api.post(`/admin/users/${userId}/change-password`, { newPassword });
    // addNotification('🔑 Password changed successfully!', 'success');
  }, [addNotification]);

  const changeOwnPassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await api.post('/admin/change-password', { oldPassword, newPassword });
      addNotification('✅ Password updated successfully.', 'success');
    } catch (err) {
      addNotification('❌ Failed to update password. Check your current password.', 'error');
    }
  }, [addNotification]);





  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    merchants,
    transactions: getFilteredTransactions(),
    refreshTransactions: fetchTransactions,
    addMerchant,
    updateMerchant,
    deleteMerchant,
    addUser,
    getUserMerchant,
    allMerchants: merchants,
    allTransactions: transactions,
    toggleDisabled, 
    toggleWithdrawals,
    changePassword,
    changeUserPassword,
    changeOwnPassword,
    activityLogs,
    refreshActivityLogs: fetchActivityLogs
  }), [
    user,
    loading,
    login,
    logout,
    merchants,
    getFilteredTransactions,
    addMerchant,
    updateMerchant,
    deleteMerchant,
    addUser,
    getUserMerchant,
    transactions,
    toggleDisabled,
    toggleWithdrawals,
    changePassword,
    changeUserPassword,
    changeOwnPassword,
    activityLogs,
    fetchTransactions,
    fetchActivityLogs

  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
