import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';
import api from '../api/axios';
import { UserFormData } from '../types/User';

type AnimationState = 'out-left' | 'out-right' | 'in-left' | 'in-right' | 'fade-in' | null;

interface ProfileWithId extends UserFormData {
    userId: number;
}

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [currentProfile, setCurrentProfile] = useState<ProfileWithId | null>(null);
    const [nextProfile, setNextProfile] = useState<ProfileWithId | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [noMoreProfiles, setNoMoreProfiles] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>(null);
    const [error, setError] = useState<string | null>(null);
    
    const queue = useRef<number[]>([]);

    const fetchProfile = async (userId: number): Promise<ProfileWithId> => {
        const [user, profile, bio] = await Promise.all([
            api.get(`/users/${userId}`),
            api.get(`/users/${userId}/profile`),
            api.get(`/users/${userId}/bio`)
        ]);

        return {
            userId,
            name: user.data.name,
            age: profile.data.age.toString(),
            gender: bio.data.gender,
            bio: profile.data.bio,
            hobbies: bio.data.hobbies,
            lookingFor: bio.data.lookingFor,
            lookingForGender: bio.data.lookingForGender,
            latitude: bio.data.latitude,
            longitude: bio.data.longitude,
            maxRadiusKm: bio.data.maxRadiusKm,
            profilePicture: user.data.profilePictureUrl || null
        };
    };

    const fetchMoreIds = async (): Promise<boolean> => {
        const response = await api.get<number[]>('/recommendations');
        if (response.data.length > 0) {
            queue.current.push(...response.data);
            return true;
        }
        return false;
    };

    const loadNext = async (animateFrom?: 'left' | 'right') => {
        if (queue.current.length === 0) {
            const hasMore = await fetchMoreIds();
            if (!hasMore) {
                setNoMoreProfiles(true);
                setCurrentProfile(null);
                setIsLoading(false);
                return;
            }
        }

        const userId = queue.current.shift()!;
        const profile = await fetchProfile(userId);
        
        setAnimationState(animateFrom ? (animateFrom === 'right' ? 'in-right' : 'in-left') : 'fade-in');
        setCurrentProfile(profile);
        setIsLoading(false);
        
        // Preload next
        if (queue.current.length === 0) await fetchMoreIds();
        if (queue.current.length > 0) {
            const next = await fetchProfile(queue.current[0]);
            setNextProfile(next);
        } else {
            setNextProfile(null);
        }
        
        setTimeout(() => setAnimationState(null), 400);
    };

    useEffect(() => {
        loadNext();
    }, []);

    const handleAction = async (actionType: 'like' | 'skip') => {
        if (!currentProfile || animationState?.startsWith('out')) return;

        const direction = actionType === 'like' ? 'right' : 'left';
        
        try {
            setAnimationState(direction === 'right' ? 'out-right' : 'out-left');
            
            // Record the interaction
            await api.post(`/${currentProfile.userId}/${actionType}`);
            
            setTimeout(async () => {
                if (nextProfile) {
                    setCurrentProfile(nextProfile);
                    setAnimationState(direction === 'right' ? 'in-right' : 'in-left');
                    queue.current.shift();
                    
                    // Preload next
                    if (queue.current.length === 0) await fetchMoreIds();
                    if (queue.current.length > 0) {
                        queue.current.shift(); // Remove the one we just showed
                        if (queue.current.length > 0) {
                            const next = await fetchProfile(queue.current[0]);
                            setNextProfile(next);
                        } else {
                            await fetchMoreIds();
                            if (queue.current.length > 0) {
                                const next = await fetchProfile(queue.current[0]);
                                setNextProfile(next);
                            } else {
                                setNextProfile(null);
                            }
                        }
                    } else {
                        setNextProfile(null);
                    }
                    
                    setTimeout(() => setAnimationState(null), 400);
                } else {
                    await loadNext(direction);
                }
            }, 350);
        } catch (err) {
            console.error(`Failed to ${actionType}:`, err);
            setError(`Failed to ${actionType} profile`);
            setAnimationState(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getAnimationClass = () => {
        switch (animationState) {
            case 'out-left': return 'animate-slide-out-left';
            case 'out-right': return 'animate-slide-out-right';
            case 'in-left': return 'animate-slide-in-from-left';
            case 'in-right': return 'animate-slide-in-from-right';
            case 'fade-in': return 'animate-fade-in';
            default: return '';
        }
    };

    return (
        <div className="h-screen overflow-hidden pb-16 md:pb-0"
            style={{ background: "linear-gradient(to top, #3b82f6, #f8fafc)" }}>
            
            <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                <LogOutButton onClick={handleLogout} />
            </div>    
          
            <div className="flex h-screen">
                <Sidebar />

                <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
                                Explore Profiles
                            </h1>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-full flex justify-center min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[740px]">
                                {isLoading ? (
                                    <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[600px] 
                                                h-[580px] sm:h-[640px] md:h-[700px] lg:h-[740px]
                                                bg-white border-2 border-gray-300 rounded-2xl shadow-2xl 
                                                animate-pulse flex flex-col">
                                        <div className="h-[300px] sm:h-[340px] md:h-[380px] lg:h-[400px] bg-gray-200 rounded-t-2xl"></div>
                                        <div className="flex-1 p-5 sm:p-6 md:p-7 lg:p-8 space-y-4">
                                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                            <div className="space-y-3">
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                                <div className="h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : currentProfile ? (
                                    <div className={getAnimationClass()}>
                                        <ProfileCard profile={currentProfile} />
                                    </div>
                                ) : noMoreProfiles ? (
                                    <div className="text-center flex flex-col items-center justify-center max-w-md px-6">
                                        <div className="w-20 h-20 mb-5 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                            No more profiles nearby
                                        </h2>
                                        <p className="text-sm md:text-base text-gray-500">
                                            Try expanding your distance or check back later
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                             
                            {currentProfile && !isLoading && (
                                <div className="flex gap-6 sm:gap-8 md:gap-12 justify-center">
                                    <SkipButton onClick={() => handleAction('skip')} />
                                    <LikeButton isLiked={false} onClick={() => handleAction('like')} />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                                          bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg
                                          animate-slide-up z-50">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;