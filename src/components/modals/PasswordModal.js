// components/modals/PasswordModal.js
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Eye, EyeOff } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSave, userEmail }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (password.length < 6) return alert('Password too short');
    onSave(password);
    setPassword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change password for ${userEmail}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">🔐 New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-300" />
              ) : (
                <Eye className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordModal;
