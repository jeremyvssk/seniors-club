import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LogInButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const LogInButton: React.FC<LogInButtonProps> = ({ onClick, className = '', disabled = false }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full py-4 px-6 rounded-xl text-2xl font-semibold
        flex items-center justify-center group
        outline-none cursor-pointer
        bg-gradient-to-t from-blue-500 via-blue-600 to-blue-700
        border border-blue-800
        text-white
        transition-all duration-200 ease-in-out
        hover:shadow-[0_4px_3px_1px_#60a5fa,0_6px_8px_#3b82f6,0_-4px_4px_#2563eb,0_-6px_4px_#60a5fa,inset_0_0_3px_3px_#1e40af]
        active:shadow-[0_4px_3px_1px_#60a5fa,0_6px_8px_#3b82f6,0_-4px_4px_#2563eb,0_-6px_4px_#60a5fa,inset_0_0_5px_3px_#1e3a8a,inset_0_0_30px_#1e40af]
        focus:shadow-[0_4px_3px_1px_#60a5fa,0_6px_8px_#3b82f6,0_-4px_4px_#2563eb,0_-6px_4px_#60a5fa,inset_0_0_5px_3px_#1e3a8a,inset_0_0_30px_#1e40af]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        fontFamily: '"Source Sans Pro", sans-serif'
      }}
    >
      Log In
      <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default LogInButton;