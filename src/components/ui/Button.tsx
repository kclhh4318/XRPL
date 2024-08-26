// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'default', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold transition-colors";
  const variantStyle = variant === 'default' 
    ? "bg-blue-500 text-white hover:bg-blue-600" 
    : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-50";

  return (
    <button className={`${baseStyle} ${variantStyle}`} {...props}>
      {children}
    </button>
  );
};

export default Button;