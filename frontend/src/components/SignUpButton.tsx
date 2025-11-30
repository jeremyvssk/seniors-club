import React from 'react';
import { Users } from 'lucide-react';

interface SignUpButtonProps {
  onClick: () => void;
  className?: string;
}

const SignUpButton: React.FC<SignUpButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-white hover:bg-slate-50 text-slate-800 py-4 px-6 rounded-xl text-2xl font-medium transition-all shadow-md hover:shadow-lg border-2 border-slate-200 flex items-center justify-center group ${className}`}
    >
      Sign Up
      <Users className="w-7 h-7 ml-3 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default SignUpButton;