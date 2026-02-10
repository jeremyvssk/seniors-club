import axios from 'axios';
import { ChatResponse, PagedMessages, ConnectionRequest, MatchedUser } from '../types';

const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const chatAPI = {
  getUserChats: async (): Promise<ChatResponse[]> => {
    const response = await axios.get(`${API_URL}/chats`, getAuthHeaders());
    return response.data;
  },

  getChatMessages: async (chatId: number, page: number = 0, size: number = 20): Promise<PagedMessages> => {
    const response = await axios.get(
      `${API_URL}/chats/${chatId}/messages?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data;
  },

  markMessagesAsRead: async (chatId: number): Promise<void> => {
    await axios.post(`${API_URL}/chats/${chatId}/read`, {}, getAuthHeaders());
  },

  getOrCreateChatWithUser: async (otherUserId: number): Promise<ChatResponse> => {
    const response = await axios.get(`${API_URL}/chats/with/${otherUserId}`, getAuthHeaders());
    return response.data;
  },
};

export const matchAPI = {
  sendConnectionRequest: async (likedUserId: number) => {
    const response = await axios.post(
      `${API_URL}/matches/request`,
      { likedUserId },
      getAuthHeaders()
    );
    return response.data;
  },

  getPendingRequests: async (): Promise<ConnectionRequest[]> => {
    const response = await axios.get(`${API_URL}/matches/requests/pending`, getAuthHeaders());
    return response.data;
  },

  acceptRequest: async (requestId: number) => {
    const response = await axios.post(
      `${API_URL}/matches/requests/${requestId}/accept`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  declineRequest: async (requestId: number): Promise<void> => {
    await axios.delete(`${API_URL}/matches/requests/${requestId}/decline`, getAuthHeaders());
  },

  disconnect: async (userId: number): Promise<void> => {
    await axios.delete(`${API_URL}/matches/disconnect/${userId}`, getAuthHeaders());
  },

  getUserMatches: async (): Promise<MatchedUser[]> => {
    const response = await axios.get(`${API_URL}/matches`, getAuthHeaders());
    return response.data;
  },
};