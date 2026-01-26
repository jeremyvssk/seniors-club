import React, { useState, useEffect } from "react";
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
import { matchService } from "../../services/match.service";

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
  const [hasNewRequests, setHasNewRequests] = useState(false);

  // Check for pending requests
  useEffect(() => {
    const checkRequests = async () => {
      try {
        const requests = await matchService.getPendingRequests();
        setHasNewRequests(requests.length > 0);
      } catch (error) {
        console.error('Failed to check requests:', error);
      }
    };

    checkRequests();

    // Poll every 30 seconds for new requests
    const interval = setInterval(checkRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Clear notification when requests section is opened
  useEffect(() => {
    if (activeSection === 'requests') {
      setHasNewRequests(false);
    }
  }, [activeSection]);

  const handleToggle = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden md:flex items-center gap-2 md:gap-3 lg:gap-4 p-2 md:p-3 h-full ${className || ''}`}>
        {/* Icon Box */}
        <div className="w-14 md:w-16 lg:w-18 rounded-xl border border-gray-400 bg-white shadow-lg">
          {items.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleToggle(id)}
              className={`relative flex h-14 md:h-16 lg:h-18 w-full items-center justify-center 
                         rounded-lg border border-black/10 p-2 md:p-3 lg:p-4
                         transition-all duration-300 ease-in-out 
                         hover:border hover:shadow-lg hover:bg-blue-50 group 
                         ${activeSection === id ? 'border shadow-lg bg-blue-50' : ''}`}
            >
              <Icon className={`h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7
                               transition-all duration-300 ease-in-out 
                               group-hover:scale-110 group-hover:text-blue-500 
                               ${activeSection === id ? 'scale-110 text-blue-500' : 'text-gray-700'}`} 
              />
              
              {/* 🔴 Only show when sidebar is closed */}
              {id === 'requests' && hasNewRequests && !activeSection && (
                <span className="absolute top-2 right-2 md:top-3 md:right-3 
                               w-2 h-2 md:w-2.5 md:h-2.5 
                               bg-red-500 rounded-full" />
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 whitespace-nowrap rounded-lg 
                             bg-black/70 px-2 md:px-3 py-1 md:py-1.5 
                             text-xs md:text-sm text-white 
                             opacity-0 transition-opacity duration-200 
                             group-hover:opacity-100 pointer-events-none z-50">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded Content Panel - Desktop */}
        <div
          className={`bg-gradient-to-br from-blue-50 to-purple-50 
                     rounded-xl md:rounded-2xl shadow-2xl 
                     transition-all duration-300 ease-in-out 
                     h-full
                     ${activeSection 
                       ? 'w-[300px] md:w-[360px] lg:w-[400px] xl:w-[600px]' 
                       : 'w-0 overflow-hidden'
                     }`}
        >
          {activeSection && (
            <div className="h-full flex flex-col">
              
              {/* Header with Close Button */}
              <div className="flex-shrink-0 flex items-center justify-between 
                            p-3 md:p-4 lg:p-5 pb-2 md:pb-3 
                            border-b border-white/50">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold capitalize text-gray-800">
                  {activeSection}
                </h2>
                <button
                  onClick={() => setActiveSection(null)}
                  className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10
                           rounded-full bg-white shadow-md 
                           flex items-center justify-center 
                           hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="md:w-5 md:h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-3 md:px-4 lg:px-5 pb-3 md:pb-4 pt-2 md:pt-3">
                {activeSection === 'messages' && <MessagesSection />}
                {activeSection === 'profile' && <ProfileSection />}
                {activeSection === 'matches' && <MatchesSection />}
                {activeSection === 'requests' && <RequestsSection />}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Always visible */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white border-t border-gray-300 shadow-2xl">
          <div className="flex justify-around items-center py-1.5 sm:py-2">
            {items.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleToggle(id)}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5
                          transition-all duration-200 
                          ${activeSection === id ? 'text-blue-500' : 'text-gray-600'}`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 
                                 transition-transform 
                                 ${activeSection === id ? 'scale-110' : ''}`} 
                />

                  {/* 🔴 Only show when section is closed */}
                  {id === 'requests' && hasNewRequests && activeSection !== 'requests' && (
                  <span className="absolute top-3 right-7 sm:top-1.5 sm:right-1.5 
                                 w-2 h-2 sm:w-2.5 sm:h-2.5 
                                 bg-red-500 rounded-full 
                                 border border-white" />
                )}

                <span className="text-[10px] sm:text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Fullscreen Panel */}
      {activeSection && (
        <div className="md:hidden fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-40 flex flex-col">
          {/* Header with Close Button on Left */}
          <div className="flex-shrink-0 flex items-center gap-3 
                        p-3 sm:p-4 bg-white border-b border-gray-200">
            {/* Close Button - Left Side */}
            <button
              onClick={() => setActiveSection(null)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full 
                       bg-gray-100 flex items-center justify-center 
                       hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <X size={20} className="sm:w-6 sm:h-6 text-gray-700" />
            </button>
            
            {/* Section Name */}
            <h2 className="text-xl sm:text-2xl font-bold capitalize text-gray-800">
              {activeSection}
            </h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20">
            {activeSection === 'messages' && <MessagesSection />}
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'matches' && <MatchesSection />}
            {activeSection === 'requests' && <RequestsSection />}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;