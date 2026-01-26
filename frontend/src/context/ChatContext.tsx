import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocket.service';
import { chatService } from '../services/chat.service';
import { Chat, Message } from '../types/Chat';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isConnected: boolean;
  totalUnreadCount: number;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string) => void;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  refreshChats: () => Promise<void>;
  openChatWithUser: (userId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Calculate total unread count
  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // Connect to WebSocket on mount
  useEffect(() => {
    if (token && userId) {
      websocketService
        .connect(token)
        .then(() => {
          setIsConnected(true);
          
          // Subscribe to incoming messages
          websocketService.subscribeToMessages(userId, (newMessage: Message) => {
            // Add message to list if it's for the active chat
            if (activeChat && newMessage.chatId === activeChat.chatId) {
              setMessages((prev) => [newMessage, ...prev]);
              
              // Mark as read immediately
              chatService.markMessagesAsRead(newMessage.chatId);
            }

            // Update chat list
            refreshChats();
          });
        })
        .catch((error) => {
          console.error('Failed to connect to WebSocket:', error);
        });
    }

    return () => {
      websocketService.disconnect();
    };
  }, [token, userId]);

  // Load chats on mount
  useEffect(() => {
    refreshChats();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.chatId, 0);
      chatService.markMessagesAsRead(activeChat.chatId);
    } else {
      setMessages([]);
      setCurrentPage(0);
      setHasMoreMessages(true);
    }
  }, [activeChat]);

  const refreshChats = async () => {
    try {
      const fetchedChats = await chatService.getUserChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const loadMessages = async (chatId: number, page: number) => {
    try {
      const data = await chatService.getChatMessages(chatId, page, 20);
      
      if (page === 0) {
        // First page - replace messages
        setMessages(data.content.reverse());
      } else {
        // Additional pages - prepend messages
        setMessages((prev) => [...data.content.reverse(), ...prev]);
      }
      
      setCurrentPage(page);
      setHasMoreMessages(page < data.totalPages - 1);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadMoreMessages = async () => {
    if (activeChat && hasMoreMessages) {
      await loadMessages(activeChat.chatId, currentPage + 1);
    }
  };

  const sendMessage = (content: string) => {
    if (!activeChat || !isConnected) return;

    websocketService.sendMessage(activeChat.otherUserId, content);
  };

  const handleSetActiveChat = (chat: Chat | null) => {
    setActiveChat(chat);
    if (chat) {
      // Mark messages as read
      chatService.markMessagesAsRead(chat.chatId);
      
      // Update unread count in local state
      setChats((prev) =>
        prev.map((c) =>
          c.chatId === chat.chatId ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };
  const openChatWithUser = async (userId: number) => {
    try {
      console.log('🔵 Opening chat with user:', userId);
      
      // Get or create chat
      const chat = await chatService.getOrCreateChatWithUser(userId);
      
      console.log('✅ Chat obtained:', chat);
      
      // Add to chats list if not already there
      setChats((prev) => {
        const exists = prev.find((c) => c.chatId === chat.chatId);
        if (!exists) {
          return [chat, ...prev];
        }
        return prev;
      });
      
      // Set as active chat
      setActiveChat(chat);
      
    } catch (error) {
      console.error('❌ Failed to open chat:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        isConnected,
        totalUnreadCount,
        setActiveChat: handleSetActiveChat,
        sendMessage,
        loadMoreMessages,
        hasMoreMessages,
        refreshChats,
        openChatWithUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};