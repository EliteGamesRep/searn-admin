import { useState } from "react";

export default function MerchantActions({ merchant, changePassword }) {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setNewPassword("");
  };

  const handleSubmitChangePassword = () => {
    changePassword(merchant, newPassword);
    handleCloseChangePasswordModal();
  };

  return (
    <div className="flex space-x-2">

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>

            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 rounded mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={handleCloseChangePasswordModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmitChangePassword}
                disabled={!newPassword.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
