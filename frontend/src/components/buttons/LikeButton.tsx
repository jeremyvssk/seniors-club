import React from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  isLiked: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean; 
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled} // Apply disabled prop
      className={`flex items-center justify-center 
                  border-2 border-gray-400 
                  p-2 sm:p-2.5 md:p-3 lg:p-4
                  rounded-full 
                  shadow-lg hover:shadow-xl
                  transition-all duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isLiked ? 'bg-green-100 text-green-600' : 'bg-white text-green-500 hover:bg-green-50'}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 ${isLiked ? 'fill-current' : ''}`} />
    </button>
  );
};

export default LikeButton;