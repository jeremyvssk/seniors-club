import React from 'react';
import { X } from 'lucide-react';

interface SkipButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled} // Apply disabled prop
      className="flex items-center justify-center 
                 border-2 border-gray-400 
                 p-2 sm:p-2.5 md:p-3 lg:p-4
                 rounded-full 
                 bg-white text-red-600 hover:bg-red-50 
                 shadow-lg hover:shadow-xl
                 transition-all duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed"  // Added disabled styling
      aria-label="Skip"
    >
      <X className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12" />
    </button>
  );
};

export default SkipButton;