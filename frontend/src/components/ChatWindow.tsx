import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Check, CheckCheck, ChevronLeft, Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { fetchViewableProfile, ProfileWithId } from '../api/profiles';
import ProfileCard from './ProfileCard';
import Modal from './ui/Modal';
import { Avatar } from './ui/design';
import { getSessionUser } from '../lib/session';
import { joinAnd } from '../lib/format';

interface Failed {
  key: number;
  content: string;
}

// One conversation. Full screen on phones (with a back button), right-hand pane on desktop
export const ChatWindow: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const {
    activeChat,
    messages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    typingUsers,
    sendTypingIndicator,
    loading,
    me,
  } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState<Failed[]>([]);
  const [other, setOther] = useState<ProfileWithId | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const keepScrollRef = useRef(false);

  const userId = getSessionUser()?.id;

  const otherUserId = activeChat?.otherUserId;
  const isOtherUserTyping = otherUserId ? typingUsers.has(otherUserId) : false;

  // Their full profile gives us age and shared hobbies for the header and the "you connected" card
  useEffect(() => {
    setOther(null);
    setFailed([]);
    setMessageInput('');
    if (!otherUserId) return;
    let alive = true;
    fetchViewableProfile(otherUserId).then((p) => alive && setOther(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [otherUserId]);

  // Auto-scroll to bottom on new messages, but not when older ones were added on top
  useEffect(() => {
    if (keepScrollRef.current) {
      keepScrollRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, failed, isOtherUserTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTypingIndicator(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (content: string) => {
    const ok = await sendMessage(content);
    if (!ok) setFailed((prev) => [...prev, { key: Date.now(), content }]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content) return;

    sendTypingIndicator(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    send(content);
    setMessageInput('');
  };

  const retry = (f: Failed) => {
    setFailed((prev) => prev.filter((x) => x.key !== f.key));
    send(f.content);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (value.trim()) {
      sendTypingIndicator(true);
      typingTimeoutRef.current = window.setTimeout(() => sendTypingIndicator(false), 3000);
    } else {
      sendTypingIndicator(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);
    const container = messagesContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;
    keepScrollRef.current = true;

    await loadMoreMessages();

    // Maintain scroll position
    if (container) {
      container.scrollTop = container.scrollHeight - scrollHeightBefore;
    }
    setIsLoadingMore(false);
  };

  const formatMessageTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB', {
      weekday: today.getTime() - date.getTime() < 6 * 86400000 ? 'long' : undefined,
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (!activeChat) return null;

  const name = activeChat.otherUserName;
  const shared = other && me ? other.hobbies.filter((h) => me.hobbies.includes(h)) : [];

  return (
    <section className="chat" aria-label={`Chat with ${name}`}>
      <header className="ch-h">
        {onBack ? (
          <button className="ib btn" aria-label="Back to messages" style={{ color: 'var(--ink)' }} onClick={onBack}>
            <ChevronLeft className="i" />
          </button>
        ) : (
          <span style={{ width: 8 }} />
        )}
        <button className="ch-who btn" onClick={() => other && setShowProfile(true)} aria-label={`View ${name}'s profile`}>
          <Avatar src={activeChat.otherUserProfilePicture} name={name} size={48} online={activeChat.isOnline} />
          <span style={{ flexGrow: 1, minWidth: 0 }}>
            <span className="ch-n">
              {name}
              {other ? `, ${other.age}` : ''}
            </span>
            <span className="ch-s">
              {activeChat.isOnline ? (
                <>
                  <span className="d" />
                  Online
                </>
              ) : (
                'Tap to see their profile'
              )}
            </span>
          </span>
        </button>
      </header>

      <div
        ref={messagesContainerRef}
        className="ch-m scroll"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop < 40 && hasMoreMessages && !isLoadingMore) handleLoadMore();
        }}
      >
        <div className="ch-spacer" />
        {!hasMoreMessages && !loading && (
          <div className="matchcard">
            <div style={{ display: 'flex' }}>
              <Avatar src={me?.profilePictureUrl} name={me?.name} size={44} className="av-ring" />
              <Avatar src={activeChat.otherUserProfilePicture} name={name} size={44} className="av-ring av-overlap" />
            </div>
            <p>
              You and {name} are connected
              {shared.length > 0 && (
                <>
                  <br />
                  You both enjoy <b style={{ color: 'var(--ink)' }}>{joinAnd(shared)}</b>
                </>
              )}
            </p>
          </div>
        )}
        {isLoadingMore && <span className="day">Loading earlier messages…</span>}

        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <React.Fragment key={date}>
            <span className="day">{date}</span>
            {dateMessages.map((message) => {
              const isOwn = message.senderId === userId;
              return (
                <div key={message.id} className={`msg ${isOwn ? 'me' : 'them'}`}>
                  <div className="bub">{message.content}</div>
                  <span className="mtime">
                    {formatMessageTime(message.createdAt)}
                    {isOwn &&
                      (message.isRead ? (
                        <CheckCheck className="s" aria-label="Read" />
                      ) : (
                        <Check className="s" aria-label="Sent" />
                      ))}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {failed.map((f) => (
          <div key={f.key} className="msg me fail">
            <div className="bub">{f.content}</div>
            <button className="retry btn" onClick={() => retry(f)}>
              <AlertCircle className="s" />
              <span>Not sent. Tap to try again</span>
            </button>
          </div>
        ))}

        {isOtherUserTyping && (
          <div className="msg them">
            <div className="bub typing" aria-label={`${name} is typing`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="ch-f">
        <label className="sr" htmlFor="msg">
          Message
        </label>
        <input
          id="msg"
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Write a message…"
          autoComplete="off"
          maxLength={2000}
        />
        <button type="submit" className="send btn" aria-label="Send" disabled={!messageInput.trim()}>
          <Send className="i" />
        </button>
      </form>

      {showProfile && other && (
        <Modal title={`${other.name}'s profile`} onClose={() => setShowProfile(false)} bare>
          <div className="preview-card">
            <ProfileCard profile={other} myHobbies={me?.hobbies} withBioSheet className="still" />
          </div>
        </Modal>
      )}
    </section>
  );
};
