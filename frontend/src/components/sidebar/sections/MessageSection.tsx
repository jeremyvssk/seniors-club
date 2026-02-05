import React from 'react';
import { useChat } from '../../../context/ChatContext';
import { MessageCircle, User } from 'lucide-react';

export const MessagesSection: React.FC = () => {
  const { chats, setActiveChat } = useChat();

  const formatTime = (dateString: string) => {
  // Backend sends: "2026-02-05T12:30:00Z" (UTC)
  // JavaScript automatically converts to user's local timezone!
  const date = new Date(dateString);
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Show actual date for older messages
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  });
};


  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">No messages yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Start matching to begin conversations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => setActiveChat(chat)}
          className="p-3 md:p-4 bg-white rounded-lg border border-gray-200 
                   hover:border-blue-400 cursor-pointer transition-all 
                   hover:shadow-md relative"
        >
          <div className="flex items-start gap-3">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              {chat.otherUserProfilePicture ? (
                <img
                  src={chat.otherUserProfilePicture}
                  alt={chat.otherUserName}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br 
                              from-blue-200 to-purple-200 
                              flex items-center justify-center">
                  <User className='w-5 h-5 md:w-6 md:h-6 text-gray-400' />
                </div>
              )}
              
              {/* Unread badge */}
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white 
                              text-xs font-bold rounded-full min-w-[18px] h-[18px] 
                              flex items-center justify-center px-1">
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </div>
              )}
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {chat.otherUserName}
                </h3>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  {formatTime(chat.lastMessageAt)}
                </span>
              </div>
              <p className={`text-xs md:text-sm truncate ${
                chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
                {chat.lastMessage || 'No messages yet'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};