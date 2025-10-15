// components/modals/ChangePasswordModal.js
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }) => {
    // console.log("ChangePasswordModal isOpen, onClose, onSubmit>>>>>>>",  isOpen, onClose, onSubmit)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  return (
    <Modal  isOpen={isOpen} onClose={onClose} title="Change password">
      <div className="bg-gray-800 p-6 rounded-xl text-white">
        <h2 className="text-lg font-semibold mb-4">Change Your Password</h2>

        <Input
          label="Current Password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter your current password"
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
        />

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!oldPassword || !newPassword) return;
              onSubmit(oldPassword, newPassword);
              setOldPassword('');
              setNewPassword('');
              onClose();
            }}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
