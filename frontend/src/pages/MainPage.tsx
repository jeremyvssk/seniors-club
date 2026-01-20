import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';
import api from '../api/axios';
import { UserFormData } from '../types/User';

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState<number[]>([]);
    const [currentProfile, setCurrentProfile] = useState<UserFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch recommendations on component mount
    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Fetch current profile details when recommendations change
    useEffect(() => {
        if (recommendations.length > 0) {
            fetchCurrentProfile(recommendations[0]);
        } else {
            setCurrentProfile(null);
            setLoading(false);
        }
    }, [recommendations]);

    // 1. Get list of recommendation IDs
    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<number[]>('/recommendations');
            setRecommendations(response.data);
        } catch (err: any) {
            console.error('Failed to fetch recommendations:', err);
            setError('Failed to load recommendations');
            setLoading(false);
        }
    };

    // 2. Fetch full profile data for a specific user ID
    const fetchCurrentProfile = async (userId: number) => {
        try {
            setLoading(true);
            
            // Fetch all three endpoints in parallel
            const [userResponse, profileResponse, bioResponse] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/profile`),
                api.get(`/users/${userId}/bio`)
            ]);

            // Combine the data into UserFormData format
            const combinedProfile: UserFormData = {
                name: userResponse.data.name,
                age: profileResponse.data.age.toString(),
                gender: bioResponse.data.gender,
                bio: profileResponse.data.bio,
                hobbies: bioResponse.data.hobbies,
                lookingFor: bioResponse.data.lookingFor,
                lookingForGender: bioResponse.data.lookingForGender,
                latitude: bioResponse.data.latitude,
                longitude: bioResponse.data.longitude,
                maxRadiusKm: bioResponse.data.maxRadiusKm,
                profilePicture: userResponse.data.profilePictureUrl || null
            };

            setCurrentProfile(combinedProfile);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile details');
            setLoading(false);
        }
    };

    // 3. Handle Like action
    const handleLike = async () => {
        if (recommendations.length === 0) return;

        const currentUserId = recommendations[0];
        
        try {
            // Send like to backend
            await api.post(`/${currentUserId}/like`);
            
            // Remove current user from recommendations and show next
            const newRecommendations = recommendations.slice(1);
            setRecommendations(newRecommendations);
            
            console.log('Liked user:', currentUserId);
        } catch (err) {
            console.error('Failed to like profile:', err);
            setError('Failed to like profile');
        }
    };

    // 4. Handle Skip action
    const handleSkip = async () => {
        if (recommendations.length === 0) return;

        const currentUserId = recommendations[0];
        
        try {
            // Send skip to backend
            await api.post(`/${currentUserId}/skip`);
            
            // Remove current user from recommendations and show next
            const newRecommendations = recommendations.slice(1);
            setRecommendations(newRecommendations);
            
            console.log('Skipped user:', currentUserId);
        } catch (err) {
            console.error('Failed to skip profile:', err);
            setError('Failed to skip profile');
        }
    };

    // 5. Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="h-screen overflow-hidden pb-16 md:pb-0"
                style={{
                    background: "linear-gradient(to top, #3b82f6, #f8fafc )"
                }}>
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-700 text-lg">Loading recommendations...</p>
                    </div>
                </div>
            </div>
        );
    }

    // No recommendations state
    if (!currentProfile && recommendations.length === 0) {
        return (
            <div className="h-screen overflow-hidden pb-16 md:pb-0"
                style={{
                    background: "linear-gradient(to top, #3b82f6, #f8fafc )"
                }}>
                {/* Logout Button */}
                <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                    <LogOutButton onClick={handleLogout} />
                </div>

                <div className="flex h-screen">
                    <Sidebar />
                    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">😔</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                No More Recommendations
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Check back later for new matches!
                            </p>
                            <button
                                onClick={fetchRecommendations}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Refresh Recommendations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen overflow-hidden pb-16 md:pb-0"
                style={{
                    background: "linear-gradient(to top, #3b82f6, #f8fafc )"
                }}>
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">
                            Error
                        </h2>
                        <p className="text-gray-700 mb-6">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                fetchRecommendations();
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden pb-16 md:pb-0"
            style={{
                background: "linear-gradient(to top, #3b82f6, #f8fafc )"
            }}>
            
            {/* Logout Button - Top Right - Always visible */}
            <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                <LogOutButton  />
            </div>    
          
            <div className="flex h-screen">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content - centered */}
                <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-gray-800 text-center mt-12 sm:mt-14 md:mt-0">
                            Explore Profiles
                        </h1>
                        
                        {/* Recommendations counter */}
                        <p className="text-center text-gray-600 text-sm mb-4">
                            {recommendations.length} {recommendations.length === 1 ? 'profile' : 'profiles'} remaining
                        </p>

                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            {/* Profile Card */}
                            {currentProfile && (
                                <ProfileCard profile={currentProfile} />
                            )}
                             
                            {/* Action Buttons */}
                            <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center mt-2 mb-4 sm:mb-6">
                                <SkipButton onClick={handleSkip} />
                                <LikeButton
                                    isLiked={false}
                                    onClick={handleLike}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;