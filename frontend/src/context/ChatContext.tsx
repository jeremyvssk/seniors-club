import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { chatAPI, matchAPI } from '../api/api';
import api from '../api/axios';
import { getErrorMessage } from '../api/profiles';
import { websocketService } from '../services/websocket.service';
import { ChatResponse, LookingFor, MessageResponse } from '../types';
import { getSessionUser, getToken } from '../lib/session';

// The logged-in user's own profile, used for shared hobbies and the top bar avatar
export interface Me {
  id: number;
  name: string;
  profilePictureUrl: string | null;
  hobbies: string[];
  lookingFor: LookingFor | null;
}

interface ChatContextType {
  chats: ChatResponse[];
  chatsLoaded: boolean;
  activeChat: ChatResponse | null;
  messages: MessageResponse[];
  loading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  totalUnreadCount: number;
  typingUsers: Set<number>;
  newRequestsCount: number;
  newMatchesCount: number;
  pendingRequestsCount: number;
  connected: boolean | null;
  me: Me | null;
  matchNotice: number | null;
  dismissMatchNotice: () => void;
  refreshMe: () => Promise<void>;
  refreshRequestsCount: () => Promise<void>;
  openChatWithUser: (userId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  closeChat: () => void;
  refreshChats: () => Promise<void>;
  setActiveChat: (chat: ChatResponse | null) => void;
  loadMoreMessages: () => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  clearRequestsNotification: () => void;
  clearMatchesNotification: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const getAuthData = () => ({ token: getToken(), user: getSessionUser() });

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatResponse[]>([]);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [newMatchesCount, setNewMatchesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [matchNotice, setMatchNotice] = useState<number | null>(null);
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
    } finally {
      setChatsLoaded(true);
    }
  }, []);

  const refreshRequestsCount = useCallback(async () => {
    try {
      const pending = await matchAPI.getPendingRequests();
      setPendingRequestsCount(pending.length);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const [meRes, bioRes] = await Promise.all([api.get('/me'), api.get('/me/bio')]);
      setMe({
        id: meRes.data.id,
        name: meRes.data.name,
        profilePictureUrl: meRes.data.profilePictureUrl || null,
        hobbies: bioRes.data.hobbies || [],
        lookingFor: bioRes.data.lookingFor || null,
      });
    } catch (err) {
      console.error('Failed to fetch my profile:', err);
    }
  }, []);

  // Badge counts and my profile don't need the socket, so load them straight away
  useEffect(() => {
    if (!getAuthData().token) return;
    refreshMe();
    refreshRequestsCount();
    refreshChats();
  }, [refreshMe, refreshRequestsCount, refreshChats]);

  // WebSocket initialization - only runs once per mount
  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    const { token, user } = getAuthData();

    if (!token || !user?.id) {
      return;
    }

    // Mark as initialized before connecting to prevent double initialization
    isInitializedRef.current = true;

    // Subscriptions don't survive a reconnect, so this runs on every successful connect
    const subscribeAll = () => {
      websocketService.subscribeToMessages(user.id.toString(), (newMessage: MessageResponse) => {
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

      websocketService.subscribeToReadReceipts(user.id.toString(), ({ chatId }) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.chatId === chatId && msg.senderId === user.id
              ? { ...msg, isRead: true }
              : msg
          )
        );

        refreshChats();
      });

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

      websocketService.subscribeToTopic(`/topic/chat-created/${user.id}`, (newChat: ChatResponse) => {
        setChats(prev => {
          if (prev.some(c => c.chatId === newChat.chatId)) {
            return prev;
          }
          return [newChat, ...prev];
        });
      });

      websocketService.subscribeToTopic(`/topic/requests/${user.id}`, () => {
        setNewRequestsCount(prev => prev + 1);
        refreshRequestsCount();
      });

      // Both people get this; matchedUserId is whoever pressed Accept
      websocketService.subscribeToTopic<{ matchedUserId?: number }>(`/topic/matches/${user.id}`, (data) => {
        setNewMatchesCount(prev => prev + 1);
        if (data?.matchedUserId && data.matchedUserId !== user.id) {
          setMatchNotice(data.matchedUserId);
        }
      });

      refreshChats();
    };

    let firstConnect = true;
    const stopListening = websocketService.onStatusChange((isUp) => {
      setConnected(isUp);
      if (isUp && !firstConnect) {
        subscribeAll();
      }
    });

    websocketService.connect(token)
      .then(() => {
        firstConnect = false;
        subscribeAll();
      })
      .catch((err) => {
        console.error('WebSocket connection failed:', err);
        setConnected(false);
        // Reset on failure so it can retry
        isInitializedRef.current = false;
      });

    // Cleanup function - only runs on unmount
    return () => {
      stopListening();
      websocketService.disconnect();
      isInitializedRef.current = false;
    };
  }, [refreshChats, refreshRequestsCount]);

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
    // Only reload when a different chat is opened, not when the list refresh hands us a new object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.chatId, refreshChats]);

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

  const dismissMatchNotice = useCallback(() => {
    setMatchNotice(null);
  }, []);

  const openChatWithUser = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const chat = await chatAPI.getOrCreateChatWithUser(userId);
      setActiveChat(chat);
      await refreshChats();
    } catch (err) {
      console.error('Failed to open chat:', err);
      setError(getErrorMessage(err, 'Failed to open chat'));
      throw err;
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

  // Returns false when the message could not be handed to the socket, so the chat can offer a retry
  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat || !content.trim()) return false;

    if (!websocketService.isConnected()) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      websocketService.sendMessage(activeChat.otherUserId, content.trim());
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
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
      chatsLoaded,
      activeChat,
      messages,
      loading,
      error,
      hasMoreMessages,
      totalUnreadCount,
      typingUsers,
      newRequestsCount,
      newMatchesCount,
      pendingRequestsCount,
      connected,
      me,
      matchNotice,
      dismissMatchNotice,
      refreshMe,
      refreshRequestsCount,
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

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
