import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, MessageCircle } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { MessagesSection } from "../components/sidebar/sections/MessageSection";
import { ChatWindow } from "../components/ChatWindow";
import { EmptyState, Spinner } from "../components/ui/design";
import { useIsDesktop } from "../hooks/useIsDesktop";

const MessagesPage: React.FC = () => {
  const { chats, chatsLoaded, activeChat, setActiveChat, openChatWithUser } = useChat();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const autoOpened = useRef(false);

  // Desktop always has a conversation open when there is one
  useEffect(() => {
    if (isDesktop && !activeChat && chats.length > 0 && !autoOpened.current) {
      autoOpened.current = true;
      openChatWithUser(chats[0].otherUserId).catch(() => {});
    }
  }, [isDesktop, activeChat, chats, openChatWithUser]);


  if (!chatsLoaded) {
    return (
      <div className="page">
        <header className="ph-h ph-only"><h1>Messages</h1></header>
        <Spinner label="Loading conversations" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="page">
        <header className="ph-h"><h1>Messages</h1></header>
        <main className="page-empty">
          <EmptyState
            icon={<MessageCircle className="i" />}
            heading="No messages yet"
            text="When someone accepts your request, you can talk to them here."
            action={
              <button className="b-lg pri btn" onClick={() => navigate("/explore")}>
                <Layers className="i" />
                <span>Find people</span>
              </button>
            }
          />
        </main>
      </div>
    );
  }

  if (!isDesktop) {
    if (activeChat) return <ChatWindow onBack={() => setActiveChat(null)} />;
    return (
      <div className="page">
        <header className="ph-h"><h1>Messages</h1></header>
        <main className="page-list scroll">
          <MessagesSection />
        </main>
      </div>
    );
  }

  return (
    <div className="msgs-desk">
      <section className="msgs-list" aria-label="Conversations">
        <h1 className="desk-h1">Messages</h1>
        <div className="scroll msgs-scroll">
          <MessagesSection />
        </div>
      </section>
      <div className="msgs-pane">{activeChat ? <ChatWindow /> : <Spinner />}</div>
    </div>
  );
};

export default MessagesPage;
