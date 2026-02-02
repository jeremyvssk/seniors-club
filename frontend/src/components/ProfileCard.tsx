import React, { useState } from 'react';
import { User, MapPin } from 'lucide-react';
import { ViewableProfile } from '../types/User';

interface ProfileCardProps {
  profile: ViewableProfile;
  distanceKm?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, distanceKm }) => {
  const [showBio, setShowBio] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const {
    name,
    age,
    bio,
    profilePicture,
    hobbies = [],
    lookingFor,
  } = profile;

  // Debug: log what profilePicture we received
  console.log('ProfileCard received profilePicture:', profilePicture);

  // Temporary debug - show URL as text
  if (profilePicture) {
    console.log('Trying to load image from:', profilePicture);
  }

  return (
    <div className="w-[340px] sm:w-[380px] md:w-[420px]
                    min-h-[480px] sm:min-h-[500px] md:min-h-[520px]
                    bg-white rounded-2xl shadow-2xl 
                    overflow-hidden flex flex-col
                    transform-gpu">
      
      {/* Image/Bio Section - Fixed height */}
      <div 
        onClick={() => setShowBio(!showBio)}
        className="relative h-[280px] sm:h-[300px] md:h-80
                   bg-linear-to-br from-gray-100 to-gray-200 
                   flex items-center justify-center shrink-0 cursor-pointer
                   group"
      >
        {showBio ? (
          <div className="absolute inset-0 p-5 sm:p-6 
                         flex items-center justify-center overflow-y-auto
                         bg-linear-to-br from-blue-50 to-purple-50">
            <p className="text-gray-800 text-sm sm:text-base md:text-lg 
                         font-medium text-center leading-relaxed">
              {bio || 'No bio available'}
            </p>
          </div>
        ) : (
          <>
            {profilePicture && !imageError ? (
              <img 
                src={profilePicture.toString()}
                alt={`${name}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', profilePicture);
                  console.error('Error event:', e);
                  setImageError(true);
                }}
                onLoad={() => console.log('Image loaded successfully:', profilePicture)}
              />
            ) : (
              <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
            )}
          </>
        )}
        
        {/* Tap hint overlay */}
        <div className="absolute bottom-3 right-3 
                       bg-black/50 text-white text-xs 
                       px-2.5 py-1 rounded-full 
                       opacity-0 group-hover:opacity-100 transition-opacity
                       pointer-events-none">
          {showBio ? 'Tap for photo' : 'Tap for bio'}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        
        {/* Name, Age & Distance */}
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {name}
            </h2>
            <span className="text-lg sm:text-xl text-gray-600 font-medium shrink-0">
              {age}
            </span>
          </div>
          
          {/* Distance - FIX: Round the number properly */}
          <div className="flex items-center gap-1 mt-1 text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs sm:text-sm">
              {distanceKm !== undefined && distanceKm !== null 
                ? `${Math.round(distanceKm)} km away` 
                : 'Distance unknown'}
            </span>
          </div>
        </div>

        {/* Hobbies Section */}
        <div>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">
            Hobbies
          </p>
          <div className="flex flex-wrap gap-1.5">
            {hobbies.map((hobby, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 bg-blue-50 text-blue-600 
                         text-xs font-medium rounded-full
                         border border-blue-100"
              >
                {hobby}
              </span>
            ))}
            {hobbies.length === 0 && (
              <span className="text-xs text-gray-400 italic">No hobbies listed</span>
            )}
          </div>
        </div>

        {/* Spacer - pushes Looking For to bottom */}
        <div className="flex-1" />

        {/* Looking For - always at bottom */}
        <div>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-1.5">
            Looking for
          </p>
          <span className="inline-block px-2 py-1 
                         bg-purple-50 text-purple-600 
                         text-xs font-medium rounded-full
                         border border-purple-100 capitalize">
            {lookingFor}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;