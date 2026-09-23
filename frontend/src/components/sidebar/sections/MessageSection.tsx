import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import { Avatar } from '../../ui/design';
import { listTime } from '../../../lib/format';

// Conversation list: used on its own on phones and as the left column on desktop
export const MessagesSection: React.FC = () => {
  const { chats, openChatWithUser, activeChat } = useChat();
  const [query, setQuery] = useState('');

  const shown = chats.filter((c) => c.otherUserName?.toLowerCase().includes(query.trim().toLowerCase()));

  const handleChatClick = async (chat: typeof chats[0]) => {
    try {
      await openChatWithUser(chat.otherUserId);
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  return (
    <>
      <div className="inp" style={{ height: 50 }}>
        <Search className="s" />
        <label className="sr" htmlFor="q">Search messages</label>
        <input id="q" type="search" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {shown.length === 0 ? (
        <p className="list-note">No one called “{query.trim()}”.</p>
      ) : (
        <ul className="convos">
          {shown.map((chat) => {
            const unread = chat.unreadCount > 0;
            return (
              <li key={chat.chatId}>
                <button
                  className={`mrow btn${activeChat?.chatId === chat.chatId ? ' on' : ''}`}
                  onClick={() => handleChatClick(chat)}
                >
                  <Avatar src={chat.otherUserProfilePicture} name={chat.otherUserName} size={56} online={chat.isOnline} />
                  <span className="mrow-b">
                    <span className="mrow-t">
                      <b>{chat.otherUserName}</b>
                      <span className="mt">{chat.lastMessage ? listTime(chat.lastMessageAt) : ''}</span>
                    </span>
                    <span className={`mrow-l${unread ? ' un' : ''}`}>{chat.lastMessage || 'Say hello 👋'}</span>
                  </span>
                  {unread && (
                    <span className="badge" aria-label={`${chat.unreadCount} unread`}>
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default MessagesSection;
