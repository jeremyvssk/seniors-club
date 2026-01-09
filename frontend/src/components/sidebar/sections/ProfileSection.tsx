import React from 'react';
import { User, Edit } from 'lucide-react';
import { UserFormData } from '../../../types/User';

export const ProfileSection: React.FC = () => {
  // Mock data using UserFormData type
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
      <div className="w-full bg-white rounded-3xl shadow-xl p-8 relative">
       
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-3xl text-gray-600">{profile.age}</p>
        </div>
        
        {/* Profile Picture with Edit Button */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0 mx-8">
            <div className="w-52 h-52 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-lg">
            {profile.profilePicture ? (
                <img 
                src={profile.profilePicture.toString()} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <User className="w-32 h-32 text-gray-400" />
            )}
            </div>
            
            {/* Edit profile picture button - positioned below and centered */}
            <button className="bg-white rounded-full px-4 py-2 shadow-md text-gray-600 hover:text-blue-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span className="text-md font-medium">Edit Photo</span>
            </button>
        </div>
        </div>
        {/* Hobbies Section */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="mb-6 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-900">Hobbies</h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((hobby, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For Section */}
        {profile.lookingFor && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-900">Looking For</h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-6 h-6" />
              </button>
            </div>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium capitalize">
              {profile.lookingFor}
            </span>
          </div>
        )}

        {/* Gender Section */}
        {profile.gender && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-900">Gender</h2>
            </div>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-md font-medium capitalize">
              {profile.gender}
            </span>
          </div>
        )}

        {/* Bio Section */}
        {profile.bio && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-900">About Me</h2>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-700 leading-7 text-lg text-left">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;