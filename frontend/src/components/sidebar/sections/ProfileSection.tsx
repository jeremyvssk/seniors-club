import React from 'react';
import { User, Edit } from 'lucide-react';
import { UserFormData } from '../../../types/User';

export const ProfileSection: React.FC = () => {
  const profile: UserFormData = {
    name: "Sarah Johnson",
    age: "28",
    gender: "female",
    location: "New York, NY",
    hobbies: ["Photography", "Hiking", "Cooking", "Reading"],
    lookingFor: "Love",
    bio: "I'm a passionate photographer who loves exploring nature and trying new recipes. On weekends, you'll find me hiking mountain trails or browsing through bookstores. I believe in kindness, authenticity, and making the most of every moment.",
    profilePicture: null
  };

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 lg:p-6 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
                          rounded-full bg-gradient-to-br from-blue-200 to-purple-200 
                          flex items-center justify-center shadow-lg">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture.toString()} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-gray-400" />
              )}
            </div>
            
            <button className="bg-gray-100 rounded-full 
                             px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                             shadow-md text-gray-600 hover:text-blue-700 hover:bg-gray-200 
                             transition-colors flex items-center gap-1.5 sm:gap-2">
              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="text-xs sm:text-sm md:text-base font-medium">Edit Photo</span>
            </button>
          </div>

          {/* Name and Age */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {profile.name}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600">{profile.age} years old</p>
            {profile.location && (
              <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Hobbies Section */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                Hobbies
              </h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {profile.hobbies.map((hobby, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                           bg-blue-100 text-blue-700 
                           rounded-full text-xs sm:text-sm md:text-base 
                           font-medium"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For Section */}
        {profile.lookingFor && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                Looking For
              </h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </button>
            </div>
            <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                           bg-purple-100 text-purple-700 
                           rounded-full text-xs sm:text-sm md:text-base 
                           font-medium capitalize">
              {profile.lookingFor}
            </span>
          </div>
        )}

        {/* Gender Section */}
        {profile.gender && (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1.5 sm:mb-2 md:mb-3">
              Gender
            </h2>
            <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5
                           bg-blue-100 text-blue-700 
                           rounded-full text-xs sm:text-sm md:text-base 
                           font-medium capitalize">
              {profile.gender}
            </span>
          </div>
        )}

        {/* Bio Section */}
        {profile.bio && (
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">
                About Me
              </h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </button>
            </div>
            <p className="text-gray-700 leading-5 sm:leading-6 md:leading-7 
                        text-xs sm:text-sm md:text-base lg:text-lg text-left">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;