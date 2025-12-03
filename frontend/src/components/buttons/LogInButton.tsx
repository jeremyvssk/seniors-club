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
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl text-2xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center group ${className}`}
    >
      Log In
      <ArrowRight className="w-7 h-7 ml-3 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default LogInButton;