import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const ChatWindow: React.FC = () => {
  const { activeChat, messages, sendMessage, loadMoreMessages, hasMoreMessages, setActiveChat } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    const container = messagesContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;
    
    await loadMoreMessages();
    
    // Maintain scroll position
    if (container) {
      const scrollHeightAfter = container.scrollHeight;
      container.scrollTop = scrollHeightAfter - scrollHeightBefore;
    }
    
    setIsLoadingMore(false);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (!activeChat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {activeChat.otherUserProfilePicture ? (
              <img
                src={activeChat.otherUserProfilePicture}
                alt={activeChat.otherUserName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 
                            flex items-center justify-center text-white font-semibold">
                {getInitials(activeChat.otherUserName)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{activeChat.otherUserName}</h3>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
          
          <button
            onClick={() => setActiveChat(null)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center 
                     justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={(e) => {
            const container = e.currentTarget;
            if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
              handleLoadMore();
            }
          }}
        >
          {/* Load more indicator */}
          {hasMoreMessages && (
            <div className="text-center py-2">
              {isLoadingMore ? (
                <Loader className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
              ) : (
                <button
                  onClick={handleLoadMore}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Load older messages
                </button>
              )}
            </div>
          )}

          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => {
                const isOwn = message.senderId.toString() === userId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwn && message.isRead && (
                          <span className="text-blue-600">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                       text-white rounded-full flex items-center justify-center 
                       transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};