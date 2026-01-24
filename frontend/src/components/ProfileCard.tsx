import React, { useState } from 'react';
import { User } from 'lucide-react';
import { UserFormData } from '../types/User';

interface ProfileCardProps {
  profile: UserFormData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [showBio, setShowBio] = useState(false);
  const [expandHobbies, setExpandHobbies] = useState(false);
  
  const {
    name,
    age,
    bio,
    profilePicture,
    hobbies = [],
    lookingFor,
  } = profile;

  const visibleHobbies = expandHobbies ? hobbies : hobbies.slice(0, 3);
  const remainingCount = hobbies.length - 3;

  return (
    <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[600px] 
                    h-[580px] sm:h-[640px] md:h-[700px] lg:h-[740px]
                    bg-white rounded-2xl shadow-2xl 
                    overflow-hidden hover:shadow-3xl transition-shadow duration-300 
                    flex flex-col">
      
      {/* Image/Bio Section - FIXED HEIGHT */}
      <div 
        onClick={() => setShowBio(!showBio)}
        className="relative h-[300px] sm:h-[340px] md:h-[380px] lg:h-[400px]
                   bg-linear-to-br from-gray-100 to-gray-200 
                   flex items-center justify-center shrink-0 cursor-pointer
                   group"
      >
        {showBio ? (
          <div className="absolute inset-0 p-6 sm:p-8 md:p-10 
                         flex items-center justify-center overflow-y-auto
                         bg-linear-to-br from-blue-50 to-purple-50">
            <p className="text-gray-800 text-base sm:text-lg md:text-xl 
                         font-medium text-center leading-relaxed">
              {bio || 'No bio available'}
            </p>
          </div>
        ) : (
          <>
            {profilePicture ? (
              <img 
                src={profilePicture.toString()}
                alt={`${name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-gray-400" />
            )}
          </>
        )}
        
        {/* Hover hint - hide on mobile */}
        <div className="hidden sm:block absolute bottom-4 right-4 
                       bg-black/60 text-white text-xs sm:text-sm 
                       px-3 py-1.5 rounded-full 
                       opacity-0 group-hover:opacity-100 transition-opacity">
          {showBio ? 'View photo' : 'View bio'}
        </div>
      </div>

      {/* Info Section - FIXED HEIGHT */}
      <div className="h-[280px] sm:h-[300px] md:h-80 lg:h-[340px] 
                      p-5 sm:p-6 md:p-7 lg:p-8 
                      flex flex-col shrink-0">
        
        {/* Name & Age - FIXED HEIGHT */}
        <div className="h-[60px] sm:h-[65px] md:h-[70px] flex-shrink-0 mb-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate leading-tight">
            {name}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 font-medium">
            {age} years old
          </p>
        </div>

        {/* Hobbies Section - FIXED HEIGHT */}
        <div className="h-[110px] sm:h-[115px] md:h-[120px] flex-shrink-0 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-semibold">
              Hobbies
            </p>
            {/* Expand/Collapse button - TOP RIGHT */}
            {hobbies.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandHobbies(!expandHobbies);
                }}
                className="text-xs sm:text-sm md:text-base text-blue-600 hover:text-blue-700 
                         font-medium transition-colors flex-shrink-0"
              >
                {expandHobbies ? 'Show less' : `+${remainingCount} more`}
              </button>
            )}
          </div>
          
          {/* Fixed height container - hide scrollbar on mobile */}
          <div className="h-[80px] sm:h-[85px] md:h-[90px] overflow-y-auto pr-1
                         scrollbar-none sm:scrollbar-thin">
            <div className="flex flex-wrap gap-2">
              {visibleHobbies.map((hobby, index) => (
                <span 
                  key={index}
                  className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 
                           text-xs sm:text-sm md:text-base lg:text-lg font-medium rounded-full
                           border border-blue-200 flex-shrink-0 whitespace-nowrap"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Looking For - FIXED HEIGHT, always visible */}
        <div className="h-[70px] sm:h-[75px] md:h-[80px] flex-shrink-0">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-semibold mb-2">
            Looking for
          </p>
          <span className="inline-block px-3 py-1.5 
                         bg-purple-100 text-purple-700 
                         text-xs sm:text-sm md:text-base lg:text-lg font-medium rounded-full
                         border border-purple-200 capitalize">
            {lookingFor}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;