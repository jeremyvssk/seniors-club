import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chats';

export interface ChatResponse {
  chatId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserProfilePicture: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface PagedMessages {
  content: MessageResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const chatService = {
  // Get all chats for current user
  getUserChats: async (): Promise<ChatResponse[]> => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  // Get messages for a specific chat (paginated)
  getChatMessages: async (
    chatId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PagedMessages> => {
    const response = await axios.get(
      `${API_URL}/${chatId}/messages?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: number): Promise<void> => {
    await axios.post(`${API_URL}/${chatId}/read`, {}, getAuthHeaders());
  },
};