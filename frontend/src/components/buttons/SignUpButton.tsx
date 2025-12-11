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
      className={`
        w-full py-4 px-6 rounded-xl text-2xl font-semibold
        flex items-center justify-center group
        outline-none cursor-pointer
        bg-gradient-to-t from-[#D8D9DB] via-white to-[#FDFDFD]
        border border-[#8F9092]
        text-[#606060]
        transition-all duration-200 ease-in-out
        hover:shadow-[0_4px_3px_1px_#FCFCFC,0_6px_8px_#D6D7D9,0_-4px_4px_#CECFD1,0_-6px_4px_#FEFEFE,inset_0_0_3px_3px_#CECFD1]
        active:shadow-[0_4px_3px_1px_#FCFCFC,0_6px_8px_#D6D7D9,0_-4px_4px_#CECFD1,0_-6px_4px_#FEFEFE,inset_0_0_5px_3px_#999,inset_0_0_30px_#aaa]
        focus:shadow-[0_4px_3px_1px_#FCFCFC,0_6px_8px_#D6D7D9,0_-4px_4px_#CECFD1,0_-6px_4px_#FEFEFE,inset_0_0_5px_3px_#999,inset_0_0_30px_#aaa]
        ${className}
      `}
      style={{
        textShadow: '0 1px #fff',
        fontFamily: '"Source Sans Pro", sans-serif'
      }}
    >
      Sign Up
      <Users className="w-7 h-7 ml-3 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default SignUpButton;