import React, { useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import { matchAPI } from '../../api/api';

interface LikeButtonProps {
  userId: number;
  isLiked: boolean;
  onLikeSuccess?: (isMatch: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ userId, isLiked: initialIsLiked, onLikeSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || initialIsLiked) return;

    setIsLoading(true);

    try {
      await matchAPI.sendConnectionRequest(userId);
      /*setIsLiked(true);
      alert(response.message);*/ // "Connection request sent!"
      
      if (onLikeSuccess) {
        onLikeSuccess(true);
      }
    } catch (error: any) {
      console.error('Failed to send connection request:', error);
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || initialIsLiked}
      className={`flex items-center justify-center 
                  border-2 border-gray-400 
                  p-2 sm:p-2.5 md:p-3 lg:p-4
                  rounded-full 
                  shadow-lg hover:shadow-xl
                  transition-all duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${initialIsLiked ? 'bg-green-100 text-green-600' : 'bg-white text-green-500 hover:bg-green-50'}`}
      aria-label={initialIsLiked ? 'Request Sent' : 'Send Connection Request'}
    >
      {isLoading ? (
        <Loader className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 animate-spin" />
      ) : (
        <Heart className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 ${initialIsLiked ? 'fill-current' : ''}`} />
      )}
    </button>
  );
};

export default LikeButton;