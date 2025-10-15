import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ children, onClose, className = '' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-md ${className}`}>
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default Modal;
