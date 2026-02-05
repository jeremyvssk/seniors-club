import React, { useState, useEffect } from 'react';
import { User, UserCheck, UserX, Loader, Maximize2, X } from 'lucide-react';
import { matchAPI } from '../../../api/api';
import api from '../../../api/axios';
import ProfileCard from '../../ProfileCard';
import { ViewableProfile } from '../../../types/User';

// Extend ViewableProfile with userId and requestId, same pattern as MatchesSection
interface RequestProfileWithId extends ViewableProfile {
  userId: number;
  requestId: number;
  requestedAt?: string;
}

export const RequestsSection: React.FC = () => {
  const [requests, setRequests] = useState<RequestProfileWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<RequestProfileWithId | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('🔵 Fetching connection requests...');
      setLoading(true);
      
      // Fetch requests (returns basic info)
      const requestsData = await matchAPI.getPendingRequests();
      
      // Fetch full profile data for each request
      const fullProfiles = await Promise.all(
        requestsData.map(async (request: any) => {
          const [user, profile, bio] = await Promise.all([
            api.get(`/users/${request.userId}`),
            api.get(`/users/${request.userId}/profile`),
            api.get(`/users/${request.userId}/bio`)
          ]);

          return {
            requestId: request.requestId,
            userId: request.userId,
            name: user.data.name,
            age: bio.data.age.toString(),
            gender: bio.data.gender,
            bio: profile.data.bio,
            hobbies: bio.data.hobbies,
            lookingFor: bio.data.lookingFor,
            lookingForGender: bio.data.lookingForGender,
            profilePicture: user.data.profilePictureUrl || null,
            distanceKm: bio.data.distanceKm, // ✅ Backend calculates this
            requestedAt: request.requestedAt,
          };
        })
      );
      
      console.log('Full request profiles loaded:', fullProfiles);
      setRequests(fullProfiles);
      
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (request: RequestProfileWithId) => {
    setSelectedProfile(request);
    setShowProfileModal(true);
  };

  const handleAccept = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      const response = await matchAPI.acceptRequest(requestId);
      alert(response.message);
      setRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      alert(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await matchAPI.declineRequest(requestId);
      setRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (error: any) {
      console.error('Failed to decline request:', error);
      alert(error.response?.data?.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <User className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No connection requests</p>
        <p className="text-sm text-gray-400 mt-2">
          When someone wants to connect with you, they'll appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col gap-3 md:gap-4">
          {requests.map((request) => (
            <div 
              key={request.requestId} 
              className="relative bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 hover:shadow-xl transition-shadow"
            >
              {/* Expand Icon */}
              <button
                onClick={() => handleProfileClick(request)}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 
                         rounded-full flex items-center justify-center transition-colors z-10"
                title="View full profile"
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex gap-3 md:gap-4">
                {/* Profile Picture */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-blue-200 to-purple-200 flex items-center justify-center shadow-md shrink-0">
                  {request.profilePicture ? (
                    <img 
                      src={request.profilePicture} 
                      alt={request.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      {request.name}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600">
                      {request.age} years old
                    </p>

                    {/* Hobbies */}
                    {request.hobbies && request.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                        {request.hobbies.slice(0, 3).map((hobby, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 md:px-3 md:py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium"
                          >
                            {hobby}
                          </span>
                        ))}
                        {request.hobbies.length > 3 && (
                          <span className="px-2 py-0.5 md:px-3 md:py-1 text-gray-500 text-xs md:text-sm">
                            +{request.hobbies.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:gap-3 mt-2">
                    <button
                      onClick={() => handleAccept(request.requestId)}
                      disabled={processingId === request.requestId}
                      className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white text-sm md:text-base rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.requestId ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDecline(request.requestId)}
                      disabled={processingId === request.requestId}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-red-500 text-sm md:text-base font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.requestId ? (
                        <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      ) : (
                        <>
                          <UserX className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">Decline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ProfileCard Modal - Same pattern as MatchesSection */}
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
              className="absolute -top-9 right-6 md:-top-10 md:-right-10                      
                       w-10 h-10 bg-white rounded-full 
                       shadow-lg hover:bg-gray-100 flex items-center justify-center 
                       transition-colors z-20"  
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Just pass the profile directly - it already has all ViewableProfile fields */}
            <ProfileCard profile={selectedProfile} />
          </div>
        </div>
      )}
    </>
  );
};

export default RequestsSection;