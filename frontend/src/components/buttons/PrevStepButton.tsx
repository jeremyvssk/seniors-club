import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrevStepButtonProps {
    onClick: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export const PrevStepButton: React.FC<PrevStepButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-all ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Previous question</span>
    </button>
  );
};

export default PrevStepButton;