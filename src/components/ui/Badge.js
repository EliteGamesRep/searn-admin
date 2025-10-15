import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-600 text-gray-200',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-teal-500 text-white',
    premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;