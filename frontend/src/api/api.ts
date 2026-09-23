import api from './axios';
import { ChatResponse, PagedMessages, ConnectionRequest, MatchedUser } from '../types';

// Uses the shared axios instance: same /api proxy, token injection and 401 handling as the rest of the app

export const chatAPI = {
  getUserChats: async (): Promise<ChatResponse[]> => {
    const response = await api.get('/chats');
    return response.data;
  },

  getChatMessages: async (chatId: number, page: number = 0, size: number = 20): Promise<PagedMessages> => {
    const response = await api.get(`/chats/${chatId}/messages`, { params: { page, size } });
    return response.data;
  },

  markMessagesAsRead: async (chatId: number): Promise<void> => {
    await api.post(`/chats/${chatId}/read`, {});
  },

  getOrCreateChatWithUser: async (otherUserId: number): Promise<ChatResponse> => {
    const response = await api.get(`/chats/with/${otherUserId}`);
    return response.data;
  },
};

export const matchAPI = {
  sendConnectionRequest: async (likedUserId: number) => {
    const response = await api.post('/matches/request', { likedUserId });
    return response.data;
  },

  getPendingRequests: async (): Promise<ConnectionRequest[]> => {
    const response = await api.get('/matches/requests/pending');
    return response.data;
  },

  acceptRequest: async (requestId: number) => {
    const response = await api.post(`/matches/requests/${requestId}/accept`, {});
    return response.data;
  },

  declineRequest: async (requestId: number): Promise<void> => {
    await api.delete(`/matches/requests/${requestId}/decline`);
  },

  disconnect: async (userId: number): Promise<void> => {
    await api.delete(`/matches/disconnect/${userId}`);
  },

  getUserMatches: async (): Promise<MatchedUser[]> => {
    const response = await api.get('/matches');
    return response.data;
  },
};
