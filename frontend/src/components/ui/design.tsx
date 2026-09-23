import React from "react";
import { Heart, Handshake, Plane, Compass, User } from "lucide-react";
import { LookingFor } from "../../types/User";
import { LF_LABEL, isLookingFor } from "../../lib/format";

// Small building blocks shared by every screen. Class names live in styles/design.css

const LF_ICON: Record<LookingFor, React.ComponentType<{ className?: string }>> = {
  love: Heart,
  friend: Handshake,
  travel: Plane,
  open: Compass,
};

export const LookingForIcon: React.FC<{ kind: LookingFor; className?: string }> = ({ kind, className }) => {
  const Icon = LF_ICON[kind];
  return <Icon className={className} aria-hidden="true" />;
};

// Same shape as the hobby chips, tinted by the intention. "g" sits on photos, "l" on white
export const LookingForChip: React.FC<{ kind?: LookingFor | null; variant?: "g" | "l"; small?: boolean }> = ({
  kind,
  variant = "g",
  small = false,
}) => {
  if (!isLookingFor(kind)) return null;
  return (
    <span className={`lfc ${variant} ${kind}${small ? " sm" : ""}`}>
      <LookingForIcon kind={kind} />
      <span>{LF_LABEL[kind]}</span>
    </span>
  );
};

export const LookingForValue: React.FC<{ kind?: LookingFor | null }> = ({ kind }) => {
  if (!isLookingFor(kind)) return <b>Not set</b>;
  return (
    <b className={`lfk ${kind}`}>
      <LookingForIcon kind={kind} />
      <span>{LF_LABEL[kind]}</span>
    </b>
  );
};

export const Logo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <div className="wm" style={{ fontSize: size }}>
    <svg viewBox="0 0 30 20" style={{ width: 30, height: 20, flex: "none" }} aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="#2455D3" />
      <circle cx="20" cy="10" r="8.5" fill="#E0564A" fillOpacity="0.9" />
    </svg>
    <span>Seniors' Club</span>
  </div>
);

export const Avatar: React.FC<{ src?: string | null; name?: string; size?: number; online?: boolean; className?: string }> = ({
  src,
  name,
  size = 56,
  online = false,
  className = "",
}) => {
  const [broken, setBroken] = React.useState(false);
  return (
    <span className={`ava-w ${className}`}>
      {src && !broken ? (
        <img className="ava" src={src} alt="" style={{ width: size, height: size }} onError={() => setBroken(true)} />
      ) : (
        <span className="ava ava-fb" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
          {name ? name.charAt(0) : <User className="s" />}
        </span>
      )}
      {online && <span className="odot" />}
    </span>
  );
};

// Full-width state used when a list is empty or failed to load
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  heading: string;
  text: string;
  action?: React.ReactNode;
}> = ({ icon, heading, text, action }) => (
  <div className="empty">
    <div className="empty-ic">{icon}</div>
    <h2>{heading}</h2>
    <p>{text}</p>
    {action && <div style={{ marginTop: 6 }}>{action}</div>}
  </div>
);

export const Spinner: React.FC<{ label?: string }> = ({ label = "Loading" }) => (
  <div className="loading" role="status">
    <span className="spin-lg" aria-hidden="true" />
    <span className="sr">{label}</span>
  </div>
);
