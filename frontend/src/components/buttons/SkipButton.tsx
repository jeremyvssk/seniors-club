import React from 'react';
import { X } from 'lucide-react';

interface SkipButtonProps {
  onClick: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center border border-black/40 p-3 rounded-full bg-gray-200 text-red-600 hover:bg-red-100 transition-colors duration-300"
      aria-label="Skip"
    >
      <X className="h-18 w-18" />
    </button>
  );
};

export default SkipButton;