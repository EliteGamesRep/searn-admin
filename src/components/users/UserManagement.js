import React, { useMemo, useState } from 'react';
import { Edit, Trash2, Key, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import PasswordModal from '../modals/PasswordModal';
import UserForm from './UserForm';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';

const roleBadge = (role) => {
  switch (role) {
    case 'super_manager': return { text: '👑 Super-Manager', variant: 'info' };
    case 'store_admin':   return { text: '🏢 Store Admin', variant: 'default' };
    case 'store_manager': return { text: '🛠️ Store Manager', variant: 'default' };
    case 'store_cashier': return { text: '💵 Store Cashier', variant: 'default' };
    default:              return { text: role || 'Unknown', variant: 'default' };
  }
};

const UserManagement = () => {
  const { users, loading, refreshUsers, deleteUser } = useAdminUsers();
  const { allMerchants, changeUserPassword, user } = useAuth();
  const role = user?.role;
  const viewerMerchantId = user?.merchantId ? String(user.merchantId) : null;
  const isStoreRole = role === 'store_admin' || role === 'store_manager';
  const canCreate = ['super_admin', 'super_manager', 'store_admin', 'store_manager'].includes(role);
  const canDelete = ['super_admin', 'super_manager', 'store_admin'].includes(role);
  const canChangePassword = ['super_admin', 'store_admin', 'store_manager'].includes(role);
  const { addNotification } = useNotification();

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (isStoreRole) {
      return users.filter(u => String(u.merchantId?._id || u.merchantId) === viewerMerchantId);
    }
    return users;
  }, [users, isStoreRole, viewerMerchantId]);

  const availableMerchants = useMemo(() => {
    if (!allMerchants) return [];
    if (isStoreRole) {
      return allMerchants.filter(m => String(m._id) === viewerMerchantId);
    }
    return allMerchants;
  }, [allMerchants, isStoreRole, viewerMerchantId]);

  const canEditUser = (target) => {
    if (!canCreate) return false;
    if (isStoreRole && String(target.merchantId?._id || target.merchantId) !== viewerMerchantId) return false;
    if (role === 'store_manager' && target.role === 'store_admin') return false;
    return target.role !== 'super_admin';
  };

  const canDeleteUser = (target) => {
    if (!canDelete) return false;
    if (isStoreRole && String(target.merchantId?._id || target.merchantId) !== viewerMerchantId) return false;
    if (role === 'store_manager' && ['store_admin', 'super_manager'].includes(target.role)) return false;
    if (role === 'store_admin' && target.role === 'super_manager') return false;
    return target.role !== 'super_admin';
  };

  const canChangePasswordFor = (target) => {
    if (!canChangePassword) return false;
    if (target.role === 'super_admin') return false;
    
    // Define hierarchical permissions for password changes
    const canChangePasswordMap = {
      super_admin: new Set(['super_manager', 'store_admin', 'store_manager', 'store_cashier']),
      super_manager: new Set([]),
      store_admin: new Set(['store_manager', 'store_cashier']),
      store_manager: new Set(['store_cashier'])
    };

    const allowedTargets = canChangePasswordMap[role] || new Set();
    if (!allowedTargets.has(target.role)) {
      return false;
    }

    // Ensure same hub for store roles
    if (isStoreRole) {
      if (!viewerMerchantId || String(target.merchantId?._id || target.merchantId) !== viewerMerchantId) {
        return false;
      }
    }

    return true;
  };

  if (loading) return <div className="text-white p-6">Loading users...</div>;

  const handleDelete = async (id, email) => {
    const target = filteredUsers.find(u => u._id === id);
    if (!target || !canDeleteUser(target)) {
      addNotification('You do not have permission to delete this user.', 'error');
      return;
    }
    if (!window.confirm(`Delete ${email}?`)) return;
    try {
      await deleteUser(id);
      // addNotification('User deleted successfully', 'success');
      refreshUsers();
    } catch {
      addNotification('Failed to delete user', 'error');
    }
  };

  return (

    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          
          👥 User Management
        </h2>
        {canCreate && (
          <Button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>


      {/* User table */}
      <Card className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Hub</th>
              <th className="px-6 py-3 text-left text-xs text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredUsers.map(u => {
              const { text, variant } = roleBadge(u.role);
              return (
                <tr key={u._id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-3 text-gray-200">{u.email}</td>
                  <td className="px-6 py-3">
                    <Badge variant={variant}>{text}</Badge>
                  </td>
                  <td className="px-6 py-3 text-gray-200">{u.merchantId?.name || '—'}</td>
                  <td className="px-6 py-3 text-sm font-medium">
                    <div className="flex gap-2">
                      {/* Edit User */}
                      {canEditUser(u) && (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => { setEditing(u); setShowForm(true); }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}

                      {canChangePasswordFor(u) && (
                        <Button
                          size="small"
                          variant="default"
                          onClick={() => setPasswordUser(u)}
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                      )}

                      {canDeleteUser(u) && (
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleDelete(u._id, u.email)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <UserForm
              editing={editing}
              allMerchants={availableMerchants}
              viewerRole={role}
              viewerMerchantId={viewerMerchantId}
              onSaved={() => {
                setShowForm(false);
                setEditing(null);
                refreshUsers();
              }}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordUser && canChangePasswordFor(passwordUser) && (
        <PasswordModal
          isOpen={!!passwordUser}
          onClose={() => setPasswordUser(null)}
          userEmail={passwordUser.email}
          onSave={async (newPassword) => {
            await changeUserPassword(passwordUser._id, newPassword);
            setPasswordUser(null);
            refreshUsers();
            addNotification('Password changed successfully', 'success');
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
