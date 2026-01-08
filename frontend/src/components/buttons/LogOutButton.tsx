import React from 'react';
import { LogOut } from 'lucide-react';

interface LogOutButtonProps {
  onClick: () => void;
}

const LogOutButton: React.FC<LogOutButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2
                 px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2
                 text-xs sm:text-sm md:text-base 
                 font-medium text-red-600 hover:text-red-700 
                 bg-white/90 backdrop-blur-sm 
                 rounded-lg shadow-md hover:shadow-lg 
                 transition-all duration-300"
      aria-label="Log Out"
    >
      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      <span className="hidden xs:inline sm:inline">Log Out</span>
    </button>
  );
};

export default LogOutButton;