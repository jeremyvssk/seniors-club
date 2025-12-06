import React from 'react';
import { UserCheck } from 'lucide-react';

interface CompleteProfileButtonProps {
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const CompleteProfileButton: React.FC<CompleteProfileButtonProps> = ({ 
  onClick, 
  className = '' ,
}) => {
  
  return (
    <button
      onClick={onClick}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl text-2xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center group ${className}`}
    >
      Complete Profile
      <UserCheck className="w-7 h-7 ml-3 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default CompleteProfileButton;