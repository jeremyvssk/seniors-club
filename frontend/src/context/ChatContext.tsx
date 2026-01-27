import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { chatService, ChatResponse, MessageResponse } from '../services/chat.service';
import websocketService from '../services/websocket.service';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatContextType {
  chats: ChatResponse[];
  activeChat: ChatResponse | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  openChatWithUser: (userId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeChat: () => void;
  refreshChats: () => Promise<void>;
  setActiveChat: (chat: ChatResponse | null) => void;
  loadMoreMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Helper to get auth data from localStorage
const getAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [activeChat, setActiveChat] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const { token, user } = getAuthData();
    
    if (token && user?.id) {
      console.log('🔌 Connecting to WebSocket...');
      
      websocketService.connect(token)
        .then(() => {
          console.log('✅ WebSocket connected, subscribing to messages...');
          setWsConnected(true);
          
          // Subscribe to messages for current user
          websocketService.subscribeToMessages(user.id.toString(), (newMessage: Message) => {
            console.log('📨 New message received:', newMessage);
            
            // Add message to current chat if it matches
            setMessages(prev => {
              // Check if message already exists (avoid duplicates)
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
            
            // Update chat list
            refreshChats();
          });
        })
        .catch((err) => {
          console.error('❌ WebSocket connection failed:', err);
          setWsConnected(false);
        });

      return () => {
        console.log('🔌 Disconnecting WebSocket...');
        websocketService.disconnect();
        setWsConnected(false);
      };
    }
  }, []);

  // Fetch user's chats
  const refreshChats = useCallback(async () => {
    const { user } = getAuthData();
    if (!user?.id) return;
    
    try {
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  // Load chats on mount
  useEffect(() => {
    const { user } = getAuthData();
    if (user?.id) {
      refreshChats();
    }
  }, [refreshChats]);

  // Open chat with a specific user
  const openChatWithUser = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      // Get or create chat
      const chat = await chatService.getOrCreateChatWithUser(userId);
      setActiveChat(chat);
      setCurrentPage(0);

      // Load messages
      const messagesResponse = await chatService.getChatMessages(chat.chatId, 0, 50);
      // Messages come in desc order, reverse for display
      setMessages(messagesResponse.content.reverse());
      setHasMoreMessages(!messagesResponse.last);

      // Mark as read
      await chatService.markMessagesAsRead(chat.chatId);
      
      // Refresh chat list to update unread counts
      refreshChats();
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      setError(err.response?.data?.message || 'Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!activeChat || !hasMoreMessages) return;

    try {
      const nextPage = currentPage + 1;
      const messagesResponse = await chatService.getChatMessages(activeChat.chatId, nextPage, 50);
      
      // Prepend older messages (they come in desc order, so reverse)
      setMessages(prev => [...messagesResponse.content.reverse(), ...prev]);
      setCurrentPage(nextPage);
      setHasMoreMessages(!messagesResponse.last);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!activeChat || !content.trim()) return;

    try {
      // Send via WebSocket
      websocketService.sendMessage(activeChat.otherUserId, content.trim());
      console.log('📤 Message sent via WebSocket');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  // Close active chat
  const closeChat = () => {
    setActiveChat(null);
    setMessages([]);
    setCurrentPage(0);
    setHasMoreMessages(false);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      messages,
      loading,
      error,
      hasMoreMessages,
      openChatWithUser,
      sendMessage,
      closeChat,
      refreshChats,
      setActiveChat,
      loadMoreMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};