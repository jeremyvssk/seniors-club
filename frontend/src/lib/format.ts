// Text and data helpers shared by every screen
import { LookingFor } from "../types/User";

export const LF_LABEL: Record<LookingFor, string> = {
  love: "Love",
  friend: "Friendship",
  travel: "Travel Buddy",
  open: "Still Figuring Out",
};

export const LF_DESC: Record<LookingFor, string> = {
  love: "A romantic relationship",
  friend: "Companionship and friendship",
  travel: "Someone to explore with",
  open: "Open to different kinds of connection",
};

export const isLookingFor = (v: unknown): v is LookingFor =>
  v === "love" || v === "friend" || v === "travel" || v === "open";

export const kmText = (km?: number | null): string => {
  if (km === undefined || km === null) return "Distance unknown";
  if (km < 1) return "Under 1 km away";
  return `${Math.round(km)} km away`;
};

// Hobbies you share come first, so the ones in common are never the ones hidden
export const sortShared = (hobbies: string[] = [], mine: string[] = []) =>
  hobbies
    .map((t) => ({ t, sh: mine.includes(t) }))
    .sort((a, b) => Number(b.sh) - Number(a.sh));

export const joinAnd = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const relativeTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// Short time for the conversation list: 9:31, Yesterday, Mon, 12 Sep
export const listTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (now.getTime() - date.getTime() < 6 * 86400000) {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
