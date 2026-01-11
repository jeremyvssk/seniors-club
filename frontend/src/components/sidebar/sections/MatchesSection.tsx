import React from 'react';
import { User, UserX, MessageCircle } from 'lucide-react';
import { UserFormData } from '../../../types/User';

interface Match extends UserFormData {
  id: number;
}

const mockMatches: Match[] = [
  {
    id: 1,
    name: 'Emily Rodriguez',
    age: '65',
    gender: 'female',
    hobbies: ['Gardening', 'Book Club', 'Yoga'],
    lookingFor: 'Friend',
    profilePicture: null,
    location: 'Boston, MA'
  },
  // ... rest of mock data
];

export const MatchesSection: React.FC = () => {
  const handleSendMessage = (matchId: number, name: string) => {
    console.log(`Send message to ${name} (ID: ${matchId})`);
  };

  const handleUnfriend = (matchId: number, name: string) => {
    console.log(`Unfriend ${name} (ID: ${matchId})`);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 md:gap-4">
        {mockMatches.map((match) => (
          <div 
            key={match.id} 
            className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 hover:shadow-xl transition-shadow"
          >
            <div className="flex gap-3 md:gap-4">
              {/* Profile Picture */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-md flex-shrink-0">
                {match.profilePicture ? (
                  <img 
                    src={match.profilePicture.toString()} 
                    alt={match.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{match.name}</h3>
                  <p className="text-base md:text-lg text-gray-600">{match.age}</p>
                </div>

                {/* Hobbies */}
                {match.hobbies && match.hobbies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2 my-1.5 md:my-2">
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

                {/* Action Buttons */}
                <div className="flex gap-2 md:gap-3 mt-1.5 md:mt-2">
                  <button
                    onClick={() => handleSendMessage(match.id, match.name)}
                    className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg text-sm md:text-base font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 md:gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="inline">Message</span>
                  </button>
                  <button
                    onClick={() => handleUnfriend(match.id, match.name)}
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
  );
};

export default MatchesSection;