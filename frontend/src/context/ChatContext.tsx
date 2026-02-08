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
  const [wsConnected, setWsConnected] = useState(false);

  const activeChatRef = useRef<ChatResponse | null>(null);
  const wsConnectedRef = useRef(false);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // ADD THIS: Sync wsConnected state with ref
  useEffect(() => {
    wsConnectedRef.current = wsConnected;
  }, [wsConnected]);

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  useEffect(() => {
    const { token, user } = getAuthData();
    
    if (token && user?.id) {
      websocketAPI.disconnect();
      setCurrentUserId(user.id);
      setWsConnected(false);
      wsConnectedRef.current = false;

      websocketAPI.connect(token)
        .then(() => {
          console.log('✅ WebSocket connected');
          setWsConnected(true); 
          wsConnectedRef.current = true;
          
          // Subscribe to messages
          websocketAPI.subscribeToMessages(user.id.toString(), (newMessage: MessageResponse) => {
            console.log('📨 New message received:', newMessage);

            const currentActiveChat = activeChatRef.current;
            
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
            // If the new message is for the current active chat, mark it as read
            if (currentActiveChat && newMessage.chatId === currentActiveChat.chatId && newMessage.senderId !== user.id) {
            
              chatAPI.markMessagesAsRead(currentActiveChat.chatId)
                .then(() => {
                  console.log('✓✓ Marked message as read');
                })
                .catch(err => {
                  console.error('❌ Failed to mark message as read:', err);
                });
            }

            // refresh chat list to update last message and unread count
            refreshChats();
          });
      
 
    // Subscribe to read receipts
     websocketAPI.subscribeToReadReceipts(user.id.toString(), (data: { chatId: number; readBy: number }) => {
                              
               // Update messages in current chat
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.chatId === data.chatId && msg.senderId === user.id
                            ? { ...msg, isRead: true }
                            : msg
                        )
                      );
                      
                      // Refresh chat list to update unread counts
                      refreshChats();
                    });
          
                    // Subscribe to typing indicators
                    websocketAPI.subscribeToTyping(user.id.toString(), (data: { senderId: number; isTyping: boolean }) => {
                      console.log('👀 Typing indicator:', data);
                      
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

                    // Subscribe to chat creation notifications
                    websocketAPI.subscribeToTopic(`/topic/chat-created/${user.id}`, (newChat: ChatResponse) => {
                      console.log('📬 New chat created:', newChat);
                      setChats(prev => {
                        // Don't add duplicate chats
                        if (prev.some(c => c.chatId === newChat.chatId)) {
                          return prev;
                        }
                        // Add new chat to the top of the list
                        return [newChat, ...prev];
                      });
                    });
          
                    // ✅ Load chats AFTER WebSocket is connected
                    refreshChats();
                  })
                  .catch((err) => {
                    console.error('❌ WebSocket connection failed:', err);
                    setWsConnected(false);
                  });
          
                return () => {
                  console.log('🔌 Disconnecting WebSocket...');
                  websocketAPI.disconnect();
                  setWsConnected(false);
                  wsConnectedRef.current = false;
                };
              }
            }, []); // ✅ Only run once on mount
          
            const sendTypingIndicator = (isTyping: boolean) => {
              if (activeChat && wsConnectedRef.current) { // ✅ Check if connected
                websocketAPI.sendTypingIndicator(activeChat.otherUserId, isTyping);
              }
            };
          
            // ✅ Load messages when activeChat changes
            useEffect(() => {
              if (activeChat) {
                setMessages([]);
                setCurrentPage(0);
                setLoading(true);
          
                chatAPI.getChatMessages(activeChat.chatId, 0, 50)
                  .then(messagesResponse => {
                    setMessages(messagesResponse.content.reverse());
                    setHasMoreMessages(!messagesResponse.last);
                    
                    // Mark messages as read
                    return chatAPI.markMessagesAsRead(activeChat.chatId);
                  })
                  .then(() => {
                    // Refresh chat list after marking as read
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
                console.log('🔄 Refreshing chats...');
                const userChats = await chatAPI.getUserChats();
                setChats(userChats);
                console.log('✅ Chats refreshed:', userChats.length);
              } catch (err) {
                console.error('❌ Failed to fetch chats:', err);
              }
            }, []);
          
            useEffect(() => {
              const checkUserChange = () => {
                const { user } = getAuthData();
                if (user?.id && currentUserId && user.id !== currentUserId) {
                  console.log('🔄 User changed, reloading...');
                  window.location.reload();
                }
              };
          
              const interval = setInterval(checkUserChange, 1000);
              return () => clearInterval(interval);
            }, [currentUserId]);
          
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
            
            if (!wsConnectedRef.current) {
              console.error('❌ WebSocket not connected');
              setError('Connection lost. Please refresh the page.');
              return;
            }

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