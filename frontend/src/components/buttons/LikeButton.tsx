import React from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  isLiked: boolean;
  onClick: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center border border-black/40 p-3 rounded-full transition-colors duration-300 ${
        isLiked ? 'bg-blue-100 text-blue-500' : 'bg-gray-200 text-green-500 hover:bg-green-100'
      }`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart className={`h-18 w-18 ${isLiked ? 'fill-current' : ''}`} />
    </button>
  );
};

export default LikeButton;