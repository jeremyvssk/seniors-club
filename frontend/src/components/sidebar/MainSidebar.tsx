import React from "react";
import {
  CircleUser,
  HeartHandshake,
  MessageCircle,
  UserPlus,
  X,
} from "lucide-react";
import { MessagesSection } from "./sections/MessageSection";
import ProfileSection from "./sections/ProfileSection";
import MatchesSection from "./sections/MatchesSection";
import RequestsSection from "./sections/RequestsSection";

interface SidebarProps {
  className?: string;
}

interface SidebarItem {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const items: SidebarItem[] = [
  { id: "profile", icon: CircleUser, label: "Profile" },
  { id: "messages", icon: MessageCircle, label: "Messages" },
  { id: "matches", icon: HeartHandshake, label: "Matches" },
  { id: "requests", icon: UserPlus, label: "Requests" },
];

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const handleToggle = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <aside className={`flex items-center gap-4 ${className || ''}`}>
      {/* Icon Box */}
      <div className="w-16 rounded-2xl border border-gray-400 bg-white shadow-lg shadow-black/15">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleToggle(id)}
            className={`relative flex h-16 w-full items-center justify-center rounded-xl border border-black/10 p-4 transition-all duration-300 ease-in-out hover:border hover:shadow-lg group ${
              activeSection === id ? 'border shadow-lg' : ''
            }`}
          >
            <Icon className={`h-6 w-6 transition-all duration-300 ease-in-out group-hover:scale-125 group-hover:text-blue-400 ${
              activeSection === id ? 'scale-125 text-blue-400' : ''
            }`} />
            
            {/* Tooltip */}
            <span className="absolute left-full ml-2 whitespace-nowrap rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Expanded Content Panel */}
      <div
        className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${
          activeSection ? 'w-screen md:w-[33vw]' : 'w-0 overflow-hidden'
        }`}
        style={{ height: '80vh' }}
      >
        {activeSection && (
          <div className="h-full flex flex-col">
            {/* Header with Close Button */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 pb-4">
              <h2 className="text-3xl font-bold capitalize">{activeSection}</h2>
              <button
                onClick={() => setActiveSection(null)}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {activeSection === 'messages' && <MessagesSection />}
              {activeSection === 'profile' && <ProfileSection />}
              {activeSection === 'matches' && < MatchesSection/>}
              {activeSection === 'requests' && < RequestsSection/>}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;