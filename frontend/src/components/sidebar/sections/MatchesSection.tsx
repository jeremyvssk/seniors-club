import React, { useState, useEffect } from 'react';
import { User, UserX, MessageCircle, Loader, Maximize2, X } from 'lucide-react';
import { matchService } from '../../../services/match.service';
import { useChat } from '../../../context/ChatContext';
import ProfileCard from '../../ProfileCard'; // ✅ Import ProfileCard directly

// Match the backend DTO structure
interface MatchedUser {
  userId: number;
  name: string;
  age: string;
  profilePictureUrl: string | null;
  bio: string;
  matchedAt: string;
  hobbies?: string[];
  lookingFor?: string;
  gender?: string;
  lookingForGender?: string;
}

export const MatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openChatWithUser } = useChat();
  
  // Modals
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: number; name: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MatchedUser | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      console.log('🔵 Fetching matches...');
      setLoading(true);
      setError(null);
      
      const data = await matchService.getUserMatches();
      
      console.log('✅ Matches received:', data);
      setMatches(data);
      
    } catch (err: any) {
      console.error('❌ Failed to fetch matches:', err);
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (userId: number, name: string) => {
    console.log(`Send message to ${name} (ID: ${userId})`);
    await openChatWithUser(userId);
  };

  const handleProfileClick = (match: MatchedUser) => {
    setSelectedProfile(match);
    setShowProfileModal(true);
  };

  const handleUnfriendClick = (userId: number, name: string) => {
    setSelectedUser({ userId, name });
    setShowUnfriendModal(true);
  };

  const confirmUnfriend = async () => {
    if (!selectedUser) return;
    
    try {
      await matchService.disconnect(selectedUser.userId);
      setMatches(prev => prev.filter(m => m.userId !== selectedUser.userId));
      setShowUnfriendModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to disconnect');
      setShowUnfriendModal(false);
    }
  };

  const cancelUnfriend = () => {
    setShowUnfriendModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p className="text-lg font-medium">Error loading matches</p>
        <p className="text-sm mt-2">{error}</p>
        <button 
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <User className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No matches yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Accept connection requests to see your matches here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-3 md:gap-4">
          {matches.map((match) => (
            <div 
              key={match.userId} 
              className="relative bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 hover:shadow-xl transition-shadow"
            >
              <button
                onClick={() => handleProfileClick(match)}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 
                         rounded-full flex items-center justify-center transition-colors z-10"
                title="View full profile"
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex gap-3 md:gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-md flex-shrink-0">
                  {match.profilePictureUrl ? (
                    <img 
                      src={match.profilePictureUrl} 
                      alt={match.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      {match.name}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600">
                      {match.age} years old
                    </p>
                    
                    {match.hobbies && match.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                        {match.hobbies.slice(0, 3).map((hobby, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 md:px-3 md:py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium"
                          >
                            {hobby}
                          </span>
                        ))}
                        {match.hobbies.length > 3 && (
                          <span className="px-2 py-0.5 md:px-3 md:py-1 text-gray-500 text-xs md:text-sm">
                            +{match.hobbies.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 md:gap-3 mt-2">
                    <button
                      onClick={() => handleSendMessage(match.userId, match.name)}
                      className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg text-sm md:text-base font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 md:gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => handleUnfriendClick(match.userId, match.name)}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-red-500 text-sm md:text-base font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Unfriend</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ProfileCard Modal */}
      {showProfileModal && selectedProfile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="relative max-w-sm w-[calc(100%-2rem)] md:w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute -top-9 right-6
                       md:-top-10 md:-right-10                      
                       w-10 h-10  bg-white rounded-full 
                       shadow-lg hover:bg-gray-100 flex items-center justify-center 
                       transition-colors z-20"  
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* ProfileCard directly */}
            <ProfileCard 
              profile={{
                userId: selectedProfile.userId,
                name: selectedProfile.name,
                age: selectedProfile.age,
                bio: selectedProfile.bio,
                profilePicture: selectedProfile.profilePictureUrl || undefined,
                hobbies: selectedProfile.hobbies || [],
                lookingFor: selectedProfile.lookingFor as any,
                gender: selectedProfile.gender as any,
                lookingForGender: selectedProfile.gender as any,
              }}
            />
          </div>
        </div>
      )}

      {/* Unfriend Modal */}
      {showUnfriendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Unfriend {selectedUser.name}?
              </h3>
              <p className="text-gray-600">
                This will remove your connection with
              </p>
              <p className="text-gray-900 font-semibold mt-1">
                {selectedUser.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelUnfriend}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 
                         text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnfriend}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                         text-white font-medium rounded-lg transition-colors"
              >
                Unfriend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchesSection;