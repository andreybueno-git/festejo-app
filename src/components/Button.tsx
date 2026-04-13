import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'glass' | 'success' | 'danger' | 'blue';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const variants = {
    primary: `
      bg-gradient-to-b from-white/95 to-white/85
      text-blue-900 font-semibold
      shadow-lg shadow-black/20
      border-0
    `,
    glass: `
      bg-gradient-to-br from-white/15 to-white/8
      backdrop-blur-[20px]
      border border-white/20
      text-white font-medium
      shadow-lg shadow-black/10
    `,
    success: `
      bg-gradient-to-b from-green-500/90 to-green-600/95
      text-white font-semibold
      shadow-lg shadow-green-500/30
      border-0
    `,
    danger: `
      bg-gradient-to-br from-red-500/20 to-red-500/8
      border border-red-500/25
      text-red-300 font-medium
    `,
    blue: `
      bg-gradient-to-b from-blue-500/95 to-blue-600/98
      text-white font-semibold
      shadow-lg shadow-blue-500/30
      border-0
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-[14px] px-6 py-4 text-base
        transition-all duration-100
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
