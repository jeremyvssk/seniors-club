import React from 'react';
import { House } from 'lucide-react';

interface HomeButtonProps {
  onClick: () => void;
  className?: string;
}

export const HomeButton: React.FC<HomeButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-all ${className}`}
    >
      <House className="w-5 h-5" />
      <span>Back to home</span>
    </button>
  );
};

export default HomeButton;