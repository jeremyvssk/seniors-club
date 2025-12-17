import React from 'react';
import { User, UserCheck, UserX } from 'lucide-react';
import { UserFormData } from '../../../types/User';

interface Request extends UserFormData {
  id: number;
}

const mockRequests: Request[] = [
  {
    id: 1,
    name: 'Emily Rodriguez',
    age: '65',
    gender: 'female',
    hobbies: ['Gardening', 'Book Club', 'Yoga'],
    lookingFor: 'Friend',
    profilePicture: null,
    location: ''
  },
  {
    id: 2,
    name: 'Robert Chen',
    age: '72',
    gender: 'male',
    hobbies: ['Chess', 'Cooking', 'Travel'],
    lookingFor: 'Friend',
    profilePicture: null,
    location: ''
  },
  {
    id: 3,
    name: 'Margaret Davis',
    age: '68',
    gender: 'female',
    hobbies: ['Painting', 'Walking', 'Music'],
    lookingFor: 'Love',
    profilePicture: null,
    location: ''
  },
  {
    id: 4,
    name: 'James Wilson',
    age: '70',
    gender: 'male',
    hobbies: ['Golf', 'Photography', 'History'],
    lookingFor: 'Friend',
    profilePicture: null,
    location: ''
  },
  {
    id: 5,
    name: 'Patricia Martinez',
    age: '66',
    gender: 'female',
    hobbies: ['Dancing', 'Crafts', 'Volunteering'],
    lookingFor: 'Travel',
    profilePicture: null,
    location: ''
  },
  {
    id: 6,
    name: 'William Brown',
    age: '69',
    gender: 'male',
    hobbies: ['Fishing', 'Cards', 'Movies'],
    lookingFor: 'Friend',
    profilePicture: null,
    location: ''
  },
];

export const RequestsSection: React.FC = () => {
  const handleAccept = (requestId: number, name: string) => {
    console.log(`Accept request from ${name} (ID: ${requestId})`);
    // TODO: Implement accept logic
  };

  const handleDecline = (requestId: number, name: string) => {
    console.log(`Decline request from ${name} (ID: ${requestId})`);
    // TODO: Implement decline logic
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {mockRequests.map((request) => (
          <div 
            key={request.id} 
            className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow"
          >
            <div className="flex gap-4">
              {/* Profile Picture - Left */}
              <div className="w-36 h-38 rounded-lg bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-md flex-shrink-0">
                {request.profilePicture ? (
                  <img 
                    src={request.profilePicture.toString()} 
                    alt={request.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Content - Right */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Name and Age */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{request.name}</h3>
                  <p className="text-lg text-gray-600">{request.age} years old</p>
                  {request.location && (
                    <p className="text-sm text-gray-500">{request.location}</p>
                  )}
                </div>

                {/* Hobbies */}
                {request.hobbies && request.hobbies.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {request.hobbies.slice(0, 3).map((hobby, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {hobby}
                      </span>
                    ))}
                    {request.hobbies.length > 3 && (
                      <span className="px-3 py-1 text-gray-500 text-sm">
                        +{request.hobbies.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleAccept(request.id, request.name)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request.id, request.name)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium  hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <UserX className="w-5 h-5" />
                    Decline
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

export default RequestsSection;