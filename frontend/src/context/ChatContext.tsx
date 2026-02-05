import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { chatAPI, websocketAPI, ChatResponse, MessageResponse } from '../api/api';

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
  openChatWithUser: (userId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeChat: () => void;
  refreshChats: () => Promise<void>;
  setActiveChat: (chat: ChatResponse | null) => void;
  loadMoreMessages: () => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const getAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
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

  const activeChatRef = useRef<ChatResponse | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  useEffect(() => {
    const { token, user } = getAuthData();
    
    if (token && user?.id) {
      websocketAPI.disconnect();
      setCurrentUserId(user.id);
      
      websocketAPI.connect(token)
        .then(() => {
          websocketAPI.subscribeToMessages(user.id.toString(), (newMessage: MessageResponse) => {
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              
              const currentActiveChat = activeChatRef.current;
              if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId) {
                return [...prev, newMessage];
              }
              
              return prev;
            });

            refreshChats();
          });

          websocketAPI.subscribeToReadReceipts(user.id.toString(), (data) => {
            setMessages(prev => 
              prev.map(msg => 
                msg.chatId === data.chatId && msg.senderId === user.id
                  ? { ...msg, isRead: true }
                  : msg
              )
            );
            
            refreshChats();
          });

          websocketAPI.subscribeToTyping(user.id.toString(), (data) => {
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
        })
        .catch((err) => {
          console.error('WebSocket connection failed:', err);
        });

      return () => {
        websocketAPI.disconnect();
      };
    }
  }, []);

  const sendTypingIndicator = (isTyping: boolean) => {
    if (activeChat) {
      websocketAPI.sendTypingIndicator(activeChat.otherUserId, isTyping);
    }
  };

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
  }, [activeChat]);

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

  useEffect(() => {
    const { user } = getAuthData();
    if (user?.id) {
      refreshChats();
    }
  }, [refreshChats]);

  const openChatWithUser = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const chat = await chatAPI.getOrCreateChatWithUser(userId);
      setActiveChat(chat);
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      setError(err.response?.data?.message || 'Failed to open chat');
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

    try {
      websocketAPI.sendMessage(activeChat.otherUserId, content.trim());
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
      openChatWithUser,
      sendMessage,
      closeChat,
      refreshChats,
      setActiveChat,
      loadMoreMessages,
      sendTypingIndicator,
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