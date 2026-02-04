import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());


  //  Use ref to always have current activeChat value
  const activeChatRef = useRef<ChatResponse | null>(null);

  // Update ref whenever activeChat changes
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Calculate total unread count
  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const { token, user } = getAuthData();
    
    if (token && user?.id) {
      console.log('🔌 Connecting to WebSocket for user:', user.id);

      websocketService.disconnect();
      setCurrentUserId(user.id);
      
      websocketService.connect(token)
        .then(() => {
          console.log('✅ WebSocket connected, subscribing to messages...');
          setWsConnected(true);
          
          // Subscribe to messages for current user
          websocketService.subscribeToMessages(user.id.toString(), (newMessage: Message) => {
            console.log('📨 New message received:', newMessage);
            console.log('   - Message chatId:', newMessage.chatId);
            console.log('   - Active chatId:', activeChatRef.current?.chatId);
            
            // ONLY add message if it belongs to the active chat
            if (activeChatRef.current && newMessage.chatId === activeChatRef.current.chatId) {
              console.log('✅ Message belongs to active chat, adding to messages');
              
              setMessages(prev => {
                // Check if message already exists (avoid duplicates)
                if (prev.some(m => m.id === newMessage.id)) {
                  console.log('⚠️ Message already exists, skipping');
                  return prev;
                }
                return [...prev, newMessage];
              });
            } else {
              console.log('⚠️ Message for different chat (or no active chat), only updating chat list');
            }

            // Always refresh chat list to update unread counts and last message
            refreshChats();
          });

           // Subscribe to typing events
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

const sendTypingIndicator = (isTyping: boolean) => {
  if (activeChat) {
    websocketService.sendTypingIndicator(activeChat.otherUserId, isTyping);
  }
};

useEffect(() => {
  if (activeChat) {
    console.log('📂 Loading messages for chat:', activeChat.chatId);
    
    // Clear old messages immediately
    setMessages([]);
    setCurrentPage(0);
    setLoading(true);

    chatService.getChatMessages(activeChat.chatId, 0, 50)
      .then(messagesResponse => {
        setMessages(messagesResponse.content.reverse());
        setHasMoreMessages(!messagesResponse.last);
        
        // Mark as read
        return chatService.markMessagesAsRead(activeChat.chatId);
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
    // No active chat, clear messages
    setMessages([]);
    setCurrentPage(0);
    setHasMoreMessages(false);
  }
}, [activeChat]); // ← Runs when activeChat changes

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

  // Listen for user changes and force reload
  useEffect(() => {
    const checkUserChange = () => {
      const { user } = getAuthData();
      if (user?.id && currentUserId && user.id !== currentUserId) {
        console.log('🔄 User changed from', currentUserId, 'to', user.id);
        console.log('🔄 Forcing page reload...');
        window.location.reload();
      }
    };

    const interval = setInterval(checkUserChange, 1000);
    return () => clearInterval(interval);
  }, [currentUserId]);

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
      const chat = await chatService.getOrCreateChatWithUser(userId);
      setActiveChat(chat); // ← This triggers the effect above
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      setError(err.response?.data?.message || 'Failed to open chat');
      setLoading(false);
    }
  };

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!activeChat || !hasMoreMessages || loading) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const messagesResponse = await chatService.getChatMessages(activeChat.chatId, nextPage, 50);
      
      setMessages(prev => [...messagesResponse.content.reverse(), ...prev]);
      setCurrentPage(nextPage);
      setHasMoreMessages(!messagesResponse.last);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!activeChat || !content.trim()) return;

    try {
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