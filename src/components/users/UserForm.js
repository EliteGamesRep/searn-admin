import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Building2, UserCog, BadgeDollarSign } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../utils/axios';
import { useNotification } from '../../hooks/useNotification';
import { Eye, EyeOff } from 'lucide-react';

const BASE_ROLE_OPTIONS = [
  { value: 'super_manager', label: 'Super-Manager', desc: 'Staff super-admin (limited)', icon: Crown },
  { value: 'store_admin',   label: 'Store Admin',   desc: 'Hub owner',                  icon: Building2 },
  { value: 'store_manager', label: 'Store Manager', desc: 'Manage hub + gamerooms',     icon: UserCog },
  { value: 'store_cashier', label: 'Store Cashier', desc: 'Work on withdraws, view txns', icon: BadgeDollarSign },
];

const UserForm = ({ onSaved, onCancel, editing, allMerchants, viewerRole, viewerMerchantId }) => {
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'store_manager',
    merchantId: '',
    telegramUsername: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const availableRoleOptions = useMemo(() => {
    switch (viewerRole) {
      case 'super_admin':
        return BASE_ROLE_OPTIONS;
      case 'super_manager':
        return BASE_ROLE_OPTIONS;
      case 'store_admin':
        return BASE_ROLE_OPTIONS.filter(opt => opt.value !== 'super_manager');
      case 'store_manager':
        return BASE_ROLE_OPTIONS.filter(opt => !['super_manager', 'store_admin'].includes(opt.value));
      default:
        return [];
    }
  }, [viewerRole]);

  // Populate form for editing
  useEffect(() => {
    if (editing) {
      setFormData((prev) => ({
        ...prev,
        email: editing.email || '',
        password: '',
        role: editing.role,
        merchantId: editing.merchantId?._id || editing.merchantId || viewerMerchantId || '',
        telegramUsername: editing.telegramUsername || ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        password: '',
        role: availableRoleOptions[0]?.value || prev.role,
        merchantId: viewerRole === 'super_manager' ? '' : (viewerMerchantId || prev.merchantId)
      }));
    }
  }, [editing, viewerRole, viewerMerchantId, availableRoleOptions]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editing ? `/admin/users/${editing._id}` : '/admin/users';
      const method = editing ? 'PUT' : 'POST';
      const payload = { ...formData };

      if (editing) {
        if (!payload.password) delete payload.password;
      } else if (!payload.password) {
        addNotification('Password is required.', 'error');
        setLoading(false);
        return;
      }

      if (viewerRole === 'store_admin' || viewerRole === 'store_manager') {
        payload.merchantId = viewerMerchantId;
      }

      const { data } = await api({ url, method, data: payload });

      addNotification(`User ${editing ? 'updated' : 'created'} successfully`, 'success');

      onSaved?.(data); // refresh parent list
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.error || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <Input
        label="📧 Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="admin@searngaming.com"
      />

      {/* {!editing &&
        <Input
          label="🔒 Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={editing ? 'Leave blank to keep current password' : 'Secure password'}
        />
      } */}

      {!editing && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">🔒 Password</label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editing ? 'Leave blank to keep current password' : 'Secure password'}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoComplete="new-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-gray-300" /> : <Eye className="w-5 h-5 text-gray-300" />}
            </button>
          </div>

          {/* Optional helper text */}
          <p className="mt-1 text-xs text-gray-400">Click the eye to show/hide password.</p>
        </div>
      )}



      <Input
        label="📨 Telegram Username"
        value={formData.telegramUsername}
        onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
        placeholder="@username"
      />

      {/* Role selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">🎭 Role</label>
        <div className="grid grid-cols-2 gap-2">
          {availableRoleOptions.map((roleOpt) => {
            const Icon = roleOpt.icon;
            const selected = formData.role === roleOpt.value;
            return (
              <button
                key={roleOpt.value}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: roleOpt.value,
                    merchantId: roleOpt.value === 'super_manager'
                      ? ''
                      : (prev.merchantId || viewerMerchantId || (allMerchants[0]?._id || ''))
                  }));
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selected ? 'border-teal-500 bg-teal-500/10' : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center mb-1">
                  <Icon className={`h-4 w-4 mr-2 ${selected ? 'text-teal-400' : 'text-gray-300'}`} />
                  <span className="text-white">{roleOpt.label}</span>
                </div>
                <p className="text-xs text-gray-400">{roleOpt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Merchant selection for non-super-manager */}
      {formData.role !== 'super_manager' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">🎰 Gaming Hub</label>
          <select
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
            value={formData.merchantId}
            onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
            required
          >
            <option value="">Select a hub</option>
            {allMerchants && allMerchants.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>
          {editing ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </div>
  );
};

export default UserForm;
