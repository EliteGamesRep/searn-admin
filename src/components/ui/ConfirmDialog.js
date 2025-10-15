import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onCancel} title={title}>
      <p className="mb-4 text-gray-300">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
