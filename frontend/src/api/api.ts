import axios from 'axios';
import { Client, StompSubscription } from '@stomp/stompjs';

const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Chat response interface
export interface ChatResponse {
  chatId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserProfilePicture: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

// Message response interface
export interface MessageResponse {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Paginated messages response
export interface PagedMessages {
  content: MessageResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
}

// Connection request interface
export interface ConnectionRequest {
  requestId: number;
  userId: number;
  name: string;
  age: string;
  profilePictureUrl: string | null;
  bio: string;
  requestedAt: string;
}

// Matched user interface
export interface MatchedUser {
  userId: number;
  name: string;
  age: number;
  profilePictureUrl: string | null;
  bio: string;
  matchedAt: string;
}

// Chat API - handles all chat-related operations
export const chatAPI = {
  // Get all chats for current user
  getUserChats: async (): Promise<ChatResponse[]> => {
    const response = await axios.get(`${API_URL}/chats`, getAuthHeaders());
    return response.data;
  },

  // Get messages for a specific chat (paginated)
  getChatMessages: async (chatId: number, page: number = 0, size: number = 20): Promise<PagedMessages> => {
    const response = await axios.get(
      `${API_URL}/chats/${chatId}/messages?page=${page}&size=${size}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: number): Promise<void> => {
    await axios.post(`${API_URL}/chats/${chatId}/read`, {}, getAuthHeaders());
  },

  // Get or create chat with another user
  getOrCreateChatWithUser: async (otherUserId: number): Promise<ChatResponse> => {
    const response = await axios.get(`${API_URL}/chats/with/${otherUserId}`, getAuthHeaders());
    return response.data;
  },
};

// Match API - handles connection requests and matches
export const matchAPI = {
  // Send connection request
  sendConnectionRequest: async (likedUserId: number) => {
    const response = await axios.post(
      `${API_URL}/matches/request`,
      { likedUserId },
      getAuthHeaders()
    );
    return response.data;
  },

  // Get pending requests
  getPendingRequests: async (): Promise<ConnectionRequest[]> => {
    const response = await axios.get(`${API_URL}/matches/requests/pending`, getAuthHeaders());
    return response.data;
  },

  // Accept request
  acceptRequest: async (requestId: number) => {
    const response = await axios.post(
      `${API_URL}/matches/requests/${requestId}/accept`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Decline request
  declineRequest: async (requestId: number): Promise<void> => {
    await axios.delete(`${API_URL}/matches/requests/${requestId}/decline`, getAuthHeaders());
  },

  // Disconnect from a matched user
  disconnect: async (userId: number): Promise<void> => {
    await axios.delete(`${API_URL}/matches/disconnect/${userId}`, getAuthHeaders());
  },

  // Get all matches
  getUserMatches: async (): Promise<MatchedUser[]> => {
    const response = await axios.get(`${API_URL}/matches`, getAuthHeaders());
    return response.data;
  },
};

// WebSocket service - handles real-time messaging and typing indicators
class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private readReceiptsSubscription: StompSubscription | null = null;

  // Connect to WebSocket server
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'ws://localhost:3001/ws',
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          this.connected = true;
          resolve();
        },
        
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        },
        
        onWebSocketClose: () => {
          this.connected = false;
        },
      });

      this.client.activate();
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }

    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = null;
    }

    if (this.readReceiptsSubscription) {
      this.readReceiptsSubscription.unsubscribe();
      this.readReceiptsSubscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }

  // Subscribe to incoming messages
  subscribeToMessages(userId: string, callback: (message: MessageResponse) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.messageSubscription = this.client.subscribe(`/topic/messages/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  // Subscribe to read receipts
  subscribeToReadReceipts(userId: string, callback: (data: { chatId: number; readBy: number }) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.readReceiptsSubscription = this.client.subscribe(`/topic/read-receipts/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  // Subscribe to typing indicators
  subscribeToTyping(userId: string, callback: (data: { senderId: number; isTyping: boolean }) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.typingSubscription = this.client.subscribe(`/topic/typing/${userId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  // Send typing indicator
  sendTypingIndicator(recipientId: number, isTyping: boolean): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ recipientId, isTyping }),
    });
  }

  // Send a message
  sendMessage(recipientId: number, content: string): void {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ recipientId, content }),
    });
  }
}

export const websocketAPI = new WebSocketService();