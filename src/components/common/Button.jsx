import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 bg-blue-600 text-white rounded-md
        hover:bg-blue-700 transition-colors
        disabled:bg-gray-400 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;