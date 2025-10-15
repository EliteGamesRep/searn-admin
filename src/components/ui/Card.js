import React from 'react';

const Card = ({ children, className = '', glowing = false, ...props }) => {
  return (
    <div 
      className={`
        bg-gray-800 rounded-xl shadow-xl border border-gray-700 
        ${glowing ? 'ring-2 ring-teal-400 ring-opacity-50' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;