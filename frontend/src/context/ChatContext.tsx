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
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [newMatchesCount, setNewMatchesCount] = useState(0);
  const activeChatRef = useRef<ChatResponse | null>(null);
  const isInitializedRef = useRef(false);

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

  // WebSocket initialization - only runs once per mount
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log('WebSocket already initialized, skipping');
      return;
    }

    const { token, user } = getAuthData();
    
    if (!token || !user?.id) {
      console.log('No token or user, skipping WebSocket setup');
      return;
    }

    // Mark as initialized before connecting to prevent double initialization
    isInitializedRef.current = true;
    console.log('Initializing WebSocket for user:', user.id);

    websocketService.connect(token)
      .then(() => {
        console.log('WebSocket connected, setting up subscriptions');
        
        // Subscribe to incoming messages
        websocketService.subscribeToMessages(user.id.toString(), (newMessage: MessageResponse) => {
          console.log('New message received:', newMessage);

          const currentActiveChat = activeChatRef.current;
          
          setMessages(prev => {
            // Prevent duplicate messages
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            
            // Only add to messages if it's for the active chat
            if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId) {
              return [...prev, newMessage];
            }
            
            return prev;
          });

          // Auto-mark as read if we're viewing this chat and we didn't send it
          if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId && newMessage.senderId !== user.id) {
            chatAPI.markMessagesAsRead(currentActiveChat.chatId)
              .catch(err => console.error('Failed to mark message as read:', err));
          }

          // Refresh chat list to update unread counts
          refreshChats();
        });
    
        // Subscribe to read receipts
        websocketService.subscribeToReadReceipts(user.id.toString(), ({ chatId, readBy }) => {
          console.log('Read receipt received for chat:', chatId, 'by user:', readBy);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.chatId === chatId && msg.senderId === user.id
                ? { ...msg, isRead: true }
                : msg
            )
          );
          
          refreshChats();
        });
        
        // Subscribe to typing indicators
        websocketService.subscribeToTyping(user.id.toString(), ({ senderId, isTyping }) => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(senderId);
            } else {
              newSet.delete(senderId);
            }
            return newSet;
          });
        });

        // Subscribe to new chats being created
        websocketService.subscribeToTopic(`/topic/chat-created/${user.id}`, (newChat: ChatResponse) => {
          console.log('New chat created:', newChat);
          setChats(prev => {
            if (prev.some(c => c.chatId === newChat.chatId)) {
              return prev;
            }
            return [newChat, ...prev];
          });
        });

        // Subscribe to connection requests
        websocketService.subscribeToTopic(`/topic/requests/${user.id}`, () => {
          console.log('New connection request notification');
          setNewRequestsCount(prev => prev + 1);
        });

        // Subscribe to match notifications
        websocketService.subscribeToTopic(`/topic/matches/${user.id}`, () => {
          console.log('New match notification');
          setNewMatchesCount(prev => prev + 1);
        });
        
        // Initial chat list fetch
        refreshChats();
      })
      .catch((err) => {
        console.error('WebSocket connection failed:', err);
        // Reset on failure so it can retry
        isInitializedRef.current = false;
      });
    
    // Cleanup function - only runs on unmount
    return () => {
      console.log('ChatProvider unmounting, cleaning up WebSocket');
      websocketService.disconnect();
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - only run once

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

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (activeChat && websocketService.isConnected()) {
      websocketService.sendTypingIndicator(activeChat.otherUserId, isTyping);
    }
  }, [activeChat]);

  const clearRequestsNotification = useCallback(() => {
    setNewRequestsCount(0);
  }, []);

  const clearMatchesNotification = useCallback(() => {
    setNewMatchesCount(0);
  }, []);

  const openChatWithUser = useCallback(async (userId: number) => {
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
  }, [refreshChats]);

  const loadMoreMessages = useCallback(async () => {
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
  }, [activeChat, hasMoreMessages, loading, currentPage]);

  const sendMessage = useCallback(async (content: string) => {
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
  }, [activeChat]);

  const closeChat = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
    setCurrentPage(0);
    setHasMoreMessages(false);
  }, []);

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