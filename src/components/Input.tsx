import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-white/65 text-[13px] font-medium mb-2 ml-1 tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-black/22 border border-white/8 rounded-[14px]
          px-[18px] py-[15px] text-white text-base
          placeholder:text-white/40
          outline-none transition-colors
          focus:border-blue-400/50
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
