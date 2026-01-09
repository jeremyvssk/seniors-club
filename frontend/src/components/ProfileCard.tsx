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
      className="relative w-112 h-164 bg-gray-100 border border-black/40 rounded-lg shadow-lg overflow-hidden hover:shadow-lg  hover:scale-101 transition-all cursor-pointer"
    >
      {/* Profile Picture OR Bio Section - Toggle between them */}
      <div className="relative h-92 bg-gray-200 flex items-center justify-center">
        {showBio ? (
          // Bio View
          <div className="absolute inset-0 p-4 flex items-center justify-center overflow-y-auto"
                    style={{
                        background: "linear-gradient(to top,rgba(59, 131, 246, 0.35),rgba(248, 250, 252, 0.52) )"
                    }}>
            <p className="text-gray-700 text-lg font-medium text-center">
              {bio || 'No bio available'}
            </p>
          </div>
        ) : (
          // Profile Picture View
          <>
            {profilePicture ? (
              <img 
                /*src={profilePicture}*/
                alt={`${name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-32 h-32 text-gray-400" />
            )}
          </>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="p-4">
        {/* Name and Age */}
        <h2 className="text-4xl font-semibold text-gray-800 mb-1">
          {name} 
        </h2>
        <h2 className="text-3xl font-medium text-gray-600 mb-1">
          {age}
        </h2>

       

        {/* Hobbies/Interests */}
        <p className="text-md text-gray-600 mt-2 -mb-6">
          Hobbies:
        </p>
        {hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {hobbies.slice(0, 3).map((hobby, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-lg rounded-full"
              >
                {hobby}
              </span>
            ))}
            {hobbies.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{hobbies.length - 3} more
              </span>
            )}
          </div>
        )}
        {/* Looking for */}
        <p className="text-md text-gray-600 mt-4 -mb-6">
          Looking for:
        </p>
        {lookingFor && (
          <div className="mt-8">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-lg rounded-full">
              {lookingFor}
            </span>
          </div>
        )}
          <p className="absolute bottom-2 right-4 text-sm text-gray-400 italic">
        Click card to {showBio ? 'view picture' : 'read bio'}
      </p>
      </div>
      
    </div>
  );
};

export default ProfileCard;