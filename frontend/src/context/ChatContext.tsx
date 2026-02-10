import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { chatAPI } from '../api/api';
import { websocketService } from '../services/websocket.service';
import { ChatResponse, MessageResponse } from '../types';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface ChatContextType {
  chats: ChatResponse[];
  activeChat: ChatResponse | null;
  messages: MessageResponse[];
  loading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  totalUnreadCount: number;
  typingUsers: Set<number>;
  newRequestsCount: number;
  newMatchesCount: number;
  openChatWithUser: (userId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeChat: () => void;
  refreshChats: () => Promise<void>;
  setActiveChat: (chat: ChatResponse | null) => void;
  loadMoreMessages: () => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  clearRequestsNotification: () => void;
  clearMatchesNotification: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const getAuthData = (): { token: string | null; user: User | null } => {
  const token = sessionStorage.getItem('token');
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [activeChat, setActiveChat] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [newMatchesCount, setNewMatchesCount] = useState(0);
  const activeChatRef = useRef<ChatResponse | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const refreshChats = useCallback(async () => {
    const { user } = getAuthData();
    if (!user?.id) return;
    
    try {
      const userChats = await chatAPI.getUserChats();
      setChats(userChats);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  // Setup WebSocket subscriptions when connection is ready
  useEffect(() => {
    const { user } = getAuthData();
    
    if (!user?.id) return;

    setCurrentUserId(user.id);
    
    // Wait for WebSocket to connect, then setup all subscriptions
    const unsubscribe = websocketService.onConnect(() => {
      console.log('Setting up chat subscriptions for user:', user.id);
      
      // Subscribe to messages
      websocketService.subscribeToMessages(user.id.toString(), (newMessage: MessageResponse) => {
        console.log('New message received:', newMessage);

        const currentActiveChat = activeChatRef.current;
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          
          // Only add to messages if it's for the active chat
          if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId) {
            return [...prev, newMessage];
          }
          
          return prev;
        });

        // Auto-mark as read if in active chat and from other user
        if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId && newMessage.senderId !== user.id) {
          chatAPI.markMessagesAsRead(currentActiveChat.chatId)
            .then(() => console.log('Marked message as read'))
            .catch(err => console.error('Failed to mark message as read:', err));
        }

        refreshChats();
      });
  
      // Subscribe to read receipts
      websocketService.subscribeToReadReceipts(user.id.toString(), (data: { chatId: number; readBy: number }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.chatId === data.chatId && msg.senderId === user.id
              ? { ...msg, isRead: true }
              : msg
          )
        );
        
        refreshChats();
      });
      
      // Subscribe to typing indicators
      websocketService.subscribeToTyping(user.id.toString(), (data: { senderId: number; isTyping: boolean }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.senderId);
          } else {
            newSet.delete(data.senderId);
          }
          return newSet;
        });
      });

      // Subscribe to new chat creation
      websocketService.subscribeToTopic(`/topic/chat-created/${user.id}`, (newChat: ChatResponse) => {
        setChats(prev => {
          // Avoid duplicates
          if (prev.some(c => c.chatId === newChat.chatId)) {
            return prev;
          }
          return [newChat, ...prev];
        });
      });

      // Subscribe to connection requests
      websocketService.subscribeToTopic(`/topic/requests/${user.id}`, (data: any) => {
        console.log('RAW REQUEST NOTIFICATION RECEIVED:', data);
        setNewRequestsCount(prev => {
          const newCount = prev + 1;
          console.log('Updated newRequestsCount:', prev, '→', newCount); 
          return newCount;
        });
      });

      // Subscribe to new matches
      websocketService.subscribeToTopic(`/topic/matches/${user.id}`, (data: any) => {
        console.log('RAW MATCH NOTIFICATION RECEIVED:', data); 
        setNewMatchesCount(prev => {
          const newCount = prev + 1;
          console.log('Updated newMatchesCount:', prev, '→', newCount); 
          return newCount;
        });
      });
      
      // Load initial chats
      refreshChats();
    });
    
    return () => {
      unsubscribe();
    };
  }, []); // Only run once on mount

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      setMessages([]);
      setCurrentPage(0);
      setLoading(true);

      chatAPI.getChatMessages(activeChat.chatId, 0, 50)
        .then(messagesResponse => {
          setMessages(messagesResponse.content.reverse());
          setHasMoreMessages(!messagesResponse.last);
          
          return chatAPI.markMessagesAsRead(activeChat.chatId);
        })
        .then(() => {
          refreshChats();
        })
        .catch(err => {
          console.error('Failed to load messages:', err);
          setError('Failed to load messages');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessages([]);
      setCurrentPage(0);
      setHasMoreMessages(false);
    }
  }, [activeChat, refreshChats]);

  // Reload if user changes (e.g., logout/login)
  useEffect(() => {
    const checkUserChange = () => {
      const { user } = getAuthData();
      if (user?.id && currentUserId && user.id !== currentUserId) {
        window.location.reload();
      }
    };

    const interval = setInterval(checkUserChange, 1000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const clearRequestsNotification = useCallback(() => {
    setNewRequestsCount(0);
  }, []);

  const clearMatchesNotification = useCallback(() => {
    setNewMatchesCount(0);
  }, []);

  const sendTypingIndicator = (isTyping: boolean) => {
    if (activeChat && websocketService.isConnected()) {
      websocketService.sendTypingIndicator(activeChat.otherUserId, isTyping);
    }
  };

  const openChatWithUser = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const chat = await chatAPI.getOrCreateChatWithUser(userId);
      setActiveChat(chat);
      await refreshChats();
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      setError(err.response?.data?.message || 'Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeChat || !hasMoreMessages || loading) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const messagesResponse = await chatAPI.getChatMessages(activeChat.chatId, nextPage, 50);
      
      setMessages(prev => [...messagesResponse.content.reverse(), ...prev]);
      setCurrentPage(nextPage);
      setHasMoreMessages(!messagesResponse.last);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeChat || !content.trim()) return;
    
    if (!websocketService.isConnected()) {
      console.error('WebSocket not connected');
      setError('Connection lost. Please refresh the page.');
      return;
    }

    try {
      websocketService.sendMessage(activeChat.otherUserId, content.trim());
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

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
      totalUnreadCount,
      typingUsers,
      newRequestsCount,
      newMatchesCount,
      openChatWithUser,
      sendMessage,
      closeChat,
      refreshChats,
      setActiveChat,
      loadMoreMessages,
      sendTypingIndicator,
      clearRequestsNotification,
      clearMatchesNotification,
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