import axios from 'axios';

const API_URL = 'http://localhost:3001/api/matches';

interface LikeResponse {
  message: string;
  isMatch: boolean;
  matchId: number;
}

interface MatchedUser {
  userId: number;
  name: string;
  age: number;
  profilePictureUrl: string | null;
  bio: string;
  matchedAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const matchService = {
  // Like a user
  likeUser: async (likedUserId: number): Promise<LikeResponse> => {
    const response = await axios.post(
      `${API_URL}/like`,
      { likedUserId },
      getAuthHeaders()
    );
    return response.data;
  },

  // Unlike a user
  unlikeUser: async (likedUserId: number): Promise<void> => {
    await axios.delete(`${API_URL}/unlike/${likedUserId}`, getAuthHeaders());
  },

  // Get all matches
  getUserMatches: async (): Promise<MatchedUser[]> => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  // Check if user has liked another user
  hasUserLiked: async (likedUserId: number): Promise<boolean> => {
    const response = await axios.get(
      `${API_URL}/check/${likedUserId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};