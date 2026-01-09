import React, { useState } from 'react';
import { User } from 'lucide-react';
import { UserFormData } from '../types/User';

interface ProfileCardProps {
  profile: UserFormData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [showBio, setShowBio] = useState(false);
  
  const {
    name,
    age,
    bio,
    profilePicture,
    hobbies = [],
    lookingFor,
  } = profile;

  return (
    <div 
      onClick={() => setShowBio(!showBio)}
      className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[420px] 
                 h-[420px] sm:h-[480px] md:h-[540px] lg:h-[580px]
                 bg-white border-2 border-gray-300 rounded-xl shadow-xl 
                 overflow-hidden hover:shadow-2xl hover:scale-[1.02] 
                 transition-all duration-300 cursor-pointer"
    >
      {/* Profile Picture OR Bio Section */}
      <div className="relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-[300px] bg-gray-200 flex items-center justify-center">
        {showBio ? (
          <div className="absolute inset-0 p-3 sm:p-4 md:p-5 flex items-center justify-center overflow-y-auto"
                    style={{
                        background: "linear-gradient(to top,rgba(59, 131, 246, 0.35),rgba(248, 250, 252, 0.52) )"
                    }}>
            <p className="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center leading-relaxed">
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
              <User className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400" />
            )}
          </>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5 md:space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
            {name} 
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-600">
            {age} years old
          </p>
        </div>

        {/* Hobbies */}
        {hobbies.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium mb-1.5 sm:mb-2">
              Hobbies:
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
              {hobbies.slice(0, 3).map((hobby, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 
                           bg-blue-100 text-blue-700 
                           text-xs sm:text-sm md:text-base 
                           rounded-full font-medium"
                >
                  {hobby}
                </span>
              ))}
              {hobbies.length > 3 && (
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-gray-500 text-xs sm:text-sm">
                  +{hobbies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Looking for */}
        {lookingFor && (
          <div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium mb-1.5 sm:mb-2">
              Looking for:
            </p>
            <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 
                           bg-purple-100 text-purple-700 
                           text-xs sm:text-sm md:text-base 
                           rounded-full font-medium capitalize">
              {lookingFor}
            </span>
          </div>
        )}

        <p className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-3 md:bottom-3 md:right-4 
                     text-[10px] sm:text-xs md:text-sm text-gray-400 italic">
          Click to {showBio ? 'view picture' : 'read bio'}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;