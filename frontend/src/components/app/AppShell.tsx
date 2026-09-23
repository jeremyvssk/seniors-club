import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layers, LogOut, MessageCircle, User, UserPlus, Users, WifiOff } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { fetchViewableProfile, ProfileWithId } from "../../api/profiles";
import { Avatar, Logo } from "../ui/design";
import { joinAnd } from "../../lib/format";
import Modal from "../ui/Modal";
import { useLogout } from "../../hooks/useLogout";

const TABS = [
  { to: "/explore", label: "Explore", icon: Layers, key: "explore" },
  { to: "/messages", label: "Messages", icon: MessageCircle, key: "messages" },
  { to: "/matches", label: "Matches", icon: Users, key: "matches" },
  { to: "/requests", label: "Requests", icon: UserPlus, key: "requests" },
  { to: "/profile", label: "Profile", icon: User, key: "profile" },
] as const;

// More than 9 reads as "9+" so the badge never outgrows the icon
const Badge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span className="nbadge" aria-label={`${count} new`}>
      {count > 9 ? "9+" : count}
    </span>
  ) : null;

export const LogoutConfirm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const logout = useLogout();
  return (
    <Modal title="Log out?" onClose={onClose} small>
      <p style={{ color: "var(--muted)", fontSize: 17 }}>You can log back in any time with your email and password.</p>
      <div className="modal-a">
        <button className="b-lg sec btn" onClick={onClose}>
          Stay
        </button>
        <button className="b-lg pri btn" onClick={logout}>
          Log out
        </button>
      </div>
    </Modal>
  );
};

// "Peeter accepted your request", shown once when someone accepts while you are using the app
const MatchNotice: React.FC = () => {
  const { matchNotice, dismissMatchNotice, me, openChatWithUser } = useChat();
  const [person, setPerson] = useState<ProfileWithId | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchNotice) {
      setPerson(null);
      return;
    }
    let alive = true;
    fetchViewableProfile(matchNotice)
      .then((p) => alive && setPerson(p))
      .catch(() => dismissMatchNotice());
    const timer = window.setTimeout(dismissMatchNotice, 9000);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [matchNotice, dismissMatchNotice]);

  if (!person) return null;
  const shared = person.hobbies.filter((h) => me?.hobbies.includes(h));

  const sayHello = async () => {
    dismissMatchNotice();
    try {
      await openChatWithUser(person.userId);
      navigate("/messages");
    } catch {
      navigate("/matches");
    }
  };

  return (
    <div className="notif" role="status">
      <Avatar src={person.profilePicture} name={person.name} size={52} />
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700 }}>{person.name} accepted your request</p>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          {shared.length ? `You both enjoy ${joinAnd(shared)}` : "You are now connected"}
        </p>
      </div>
      <button className="b-md pri btn" style={{ height: 44, padding: "0 14px", fontSize: 15 }} onClick={sayHello}>
        Say hello
      </button>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { totalUnreadCount, pendingRequestsCount, newMatchesCount, connected, me, setActiveChat } = useChat();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { pathname } = useLocation();

  // Leaving Messages closes the open chat, so messages that arrive elsewhere stay unread
  useEffect(() => {
    if (!pathname.startsWith("/messages")) setActiveChat(null);
  }, [pathname, setActiveChat]);
  const counts: Record<string, number> = {
    messages: totalUnreadCount,
    requests: pendingRequestsCount,
    matches: newMatchesCount,
  };

  const navItems = (desktop: boolean) =>
    TABS.map(({ to, label, icon: Icon, key }) => (
      <NavLink key={key} to={to} className={({ isActive }) => `nb btn${isActive ? " on" : ""}`}>
        {desktop ? (
          <>
            <span className="nic">
              <Icon className="i" />
            </span>
            <span className="nl">{label}</span>
            <Badge count={counts[key] || 0} />
          </>
        ) : (
          <>
            <span className="nic">
              <Icon className="i" />
              <Badge count={counts[key] || 0} />
            </span>
            <span className="nl">{label}</span>
          </>
        )}
      </NavLink>
    ));

  return (
    <div className="shell">
      <header className="top app-top">
        <Logo />
        <nav className="tabs" aria-label="Main">
          {navItems(true)}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavLink to="/profile" aria-label="Your profile" style={{ borderRadius: "50%" }}>
            <Avatar src={me?.profilePictureUrl} name={me?.name} size={40} />
          </NavLink>
          <button className="ib btn" aria-label="Log out" onClick={() => setConfirmLogout(true)}>
            <LogOut className="i" />
          </button>
        </div>
      </header>

      {connected === false && (
        <div className="net" role="status">
          <div className="banner">
            <WifiOff className="s" />
            <span>Connection lost. Reconnecting…</span>
            <span className="spin" aria-hidden="true" />
          </div>
        </div>
      )}

      <div className="shell-main">
        <Outlet />
      </div>

      <MatchNotice />

      <nav className="bnav app-bnav" aria-label="Main">
        {navItems(false)}
      </nav>

      {confirmLogout && <LogoutConfirm onClose={() => setConfirmLogout(false)} />}
    </div>
  );
};

export default AppShell;
