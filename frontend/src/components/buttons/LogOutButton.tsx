import React from 'react';
import { LogOut } from 'lucide-react';

interface LogOutButtonProps {
  onClick: () => void;
}

const LogOutButton: React.FC<LogOutButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center  p-4 text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-300"
      aria-label="Log Out"
    >
       
      <LogOut className="h-10 w-10" />
      Log Out
    </button>
  );
};

export default LogOutButton;