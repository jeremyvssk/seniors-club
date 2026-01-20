import React, { useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import { matchService } from '../../services/match.service';

interface LikeButtonProps {
  userId: number; // ID of the user being liked
  isLiked: boolean;
  onLikeSuccess?: (isMatch: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ userId, isLiked: initialIsLiked, onLikeSuccess }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike
        await matchService.unlikeUser(userId);
        setIsLiked(false);
      } else {
        // Like
        const response = await matchService.likeUser(userId);
        setIsLiked(true);

        // Show match notification if it's a mutual match
        if (response.isMatch) {
          alert(`🎉 ${response.message}`);
          if (onLikeSuccess) {
            onLikeSuccess(true);
          }
        } else {
          if (onLikeSuccess) {
            onLikeSuccess(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to like/unlike user:', error);
      alert(error.response?.data?.message || 'Failed to process like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
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
      {isLoading ? (
        <Loader className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 animate-spin" />
      ) : (
        <Heart className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 ${isLiked ? 'fill-current' : ''}`} />
      )}
    </button>
  );
};

export default LikeButton;