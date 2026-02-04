import axios from 'axios';

const API_URL = 'http://localhost:3001/api/matches';

interface LikeResponse {
  message: string;
  isMatch: boolean;
  matchId: number;
}

interface ConnectionRequest {
  requestId: number;
  userId: number;
  name: string;
  age: string;
  profilePictureUrl: string | null;
  bio: string;
  requestedAt: string;
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
  // Send connection request
  sendConnectionRequest: async (likedUserId: number): Promise<LikeResponse> => {
    const response = await axios.post(
      `${API_URL}/request`,
      { likedUserId },
      getAuthHeaders()
    );
    return response.data;
  },

  // Get pending requests
  getPendingRequests: async (): Promise<ConnectionRequest[]> => {
    const response = await axios.get(
      `${API_URL}/requests/pending`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Accept request
  acceptRequest: async (requestId: number): Promise<LikeResponse> => {
    const response = await axios.post(
      `${API_URL}/requests/${requestId}/accept`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Decline request
  declineRequest: async (requestId: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/requests/${requestId}/decline`,
      getAuthHeaders()
    );
  },

  // Disconnect
  disconnect: async (userId: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/disconnect/${userId}`,
      getAuthHeaders()
    );
  },

  // Get all matches
  getUserMatches: async (): Promise<MatchedUser[]> => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },
};