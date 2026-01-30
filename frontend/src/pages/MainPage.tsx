import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';
import api from '../api/axios';
import { UserFormData } from '../types/User';

/* 
    Animation states for the profile card
    'out-left' = card sliding out to the left (skip)
    'out-right' = card sliding out to the right (like)
    'in-left' = new card coming in from the left
    'in-right' = new card coming in from the right
    'fade-in' = new card fading in (initial load)
    null = no animation
*/
type AnimationState = 'out-left' | 'out-right' | 'in-left' | 'in-right' | 'fade-in' | null;

interface ProfileWithId extends UserFormData {
    userId: number;
    distanceKm?: number;
}

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [currentProfile, setCurrentProfile] = useState<ProfileWithId | null>(null);
    const [nextProfile, setNextProfile] = useState<ProfileWithId | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // True when backend returns empty array (no more users to show)
    const [noMoreProfiles, setNoMoreProfiles] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>(null);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Queue of user IDs - IDs we haven't loaded yet
    const queue = useRef<number[]>([]);
    // Track IDs we've already seen (to prevent duplicates from backend)
    const seenIds = useRef<Set<number>>(new Set());
    // Ref to prevent multiple actions (synchronous check)
    const isActionInProgressRef = useRef(false);
    /*
        Fetch all profile data for a user
        "async" = this function will wait for network requests
        "await" = pause here until the request finishes
        "Promise.all" = run all 3 requests at the same time, wait for all to finish (faster than doing them one by one)          
    */
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
    /*
        Fetch more user IDs from backend and add to queue
        Returns true if we got new IDs, false if no more users
    */
    const fetchMoreIds = async (): Promise<boolean> => {
        const response = await api.get<number[]>('/recommendations');
        if (response.data.length > 0) {
            // Filter out IDs we've already seen or have in queue
            const newIds = response.data.filter(id => 
                !seenIds.current.has(id) && !queue.current.includes(id)
            );
            // Only add to queue, not to seenIds yet!
            queue.current.push(...newIds);

            return queue.current.length > 0;
        }
        return false;
    };

    // Take next ID from queue and load it as nextProfile
    const preloadNext = async () => {
        // Get more IDs if needed
        if (queue.current.length === 0) {
            await fetchMoreIds();
        }
        
        // Take from queue (remove it) and preload
        if (queue.current.length > 0) {
            const nextId = queue.current.shift()!; // Remove from queue
            const next = await fetchProfile(nextId);
            setNextProfile(next);
        } else {
            setNextProfile(null);
        }
    };
    // Load initial profile
    const loadInitial = async () => {
        // Get IDs
        const hasMore = await fetchMoreIds();
        if (!hasMore) {
            setNoMoreProfiles(true);
            setIsLoading(false);
            return;
        }

        // Load first profile
        const firstId = queue.current.shift()!;
        const first = await fetchProfile(firstId);
        
        setAnimationState('fade-in');
        setCurrentProfile(first);
        setIsLoading(false);
        
        // Preload next
        await preloadNext();
        
        setTimeout(() => setAnimationState(null), 400);
    };


    useEffect(() => {
        loadInitial();
    }, []);
    // Handle like or skip
    const handleAction = async (actionType: 'like' | 'skip') => {
        if (!currentProfile || animationState?.startsWith('out') || isActionInProgress) return;

        isActionInProgressRef.current = true; // Lock actions synchronously
        setIsActionInProgress(true); // Lock actions

        const direction = actionType === 'like' ? 'right' : 'left';
        
        try {
            // Start exit animation
            setAnimationState(direction === 'right' ? 'out-right' : 'out-left');
            
            // Tell backend about the interaction
            await api.post(`/${currentProfile.userId}/${actionType}`);

            // Mark as seen only after interaction
            seenIds.current.add(currentProfile.userId);
            // Wait for animation, then show next
            setTimeout(async () => {
                if (nextProfile) {
                    // We have a preloaded profile - use it
                    setCurrentProfile(nextProfile);
                    setAnimationState(direction === 'right' ? 'in-right' : 'in-left');
                    
                    // Preload the next one
                    await preloadNext();
                    
                    setTimeout(() => {
                        setAnimationState(null);
                        isActionInProgressRef.current = false; // Unlock after everything is done
                        setIsActionInProgress(false);
                    }, 400);
                } else {
                    // No preloaded profile - check if there are more
                    const hasMore = await fetchMoreIds();
                    if (hasMore) {
                        const nextId = queue.current.shift()!;
                        const next = await fetchProfile(nextId);
                        
                        setCurrentProfile(next);
                        setAnimationState(direction === 'right' ? 'in-right' : 'in-left');
                        
                        await preloadNext();
                        
                        setTimeout(() => {
                            setAnimationState(null);
                            isActionInProgressRef.current = false; // Unlock after everything is done
                            setIsActionInProgress(false);
                        }, 400);
                    } else {
                        // No more profiles
                        setCurrentProfile(null);
                        setNoMoreProfiles(true);
                        isActionInProgressRef.current = false; // Unlock even if no more
                        setIsActionInProgress(false);
                    }
                }
            }, 350);
        } catch (err) {
            console.error(`Failed to ${actionType}:`, err);
            setError(`Failed to ${actionType} profile`);
            setAnimationState(null);
            isActionInProgressRef.current = false; // Unlock on error
            setIsActionInProgress(false); // Update UI State
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
    // Convert animation state to CSS class name
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
            {/* Logout button - fixed in top right corner */}
            <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                <LogOutButton onClick={handleLogout} />
            </div>    
          
            <div className="flex h-screen">
                <Sidebar />

                {/* Changed: use flex-col to stack title, card, buttons vertically with justify-center */}
                <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                    
                    {/* Title */}
                    <div className="mb-4 md:mb-6 shrink-0">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
                            Explore Profiles
                        </h1>
                    </div>

                    {/* 
                      Card container - FIXED HEIGHT so buttons don't move
                      Height must be >= card min-height to prevent overlap
                    */}
                    <div className="h-[560px] sm:h-[600px] md:h-[640px] flex items-start justify-center shrink-0">
                        {/* 
                          - If loading, show skeleton
                          - Else if we have a profile, show the card
                          - Else if no more profiles, show empty state
                          - Else show nothing
                        */}
                        {isLoading ? (
                            <div className="w-[340px] sm:w-[380px] md:w-[420px]
                                        min-h-[480px] sm:min-h-[500px] md:min-h-[520px]
                                        bg-white rounded-2xl shadow-2xl 
                                        animate-pulse flex flex-col">
                                <div className="h-[280px] sm:h-[300px] md:h-[320px] bg-gray-200 rounded-t-2xl"></div>
                                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
                                    <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-14"></div>
                                    </div>
                                    <div className="flex-1"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                </div>
                            </div>
                        ) : currentProfile ? (
                            <div className={getAnimationClass()}>
                                <ProfileCard 
                                    profile={currentProfile} 
                                    distanceKm={currentProfile.distanceKm}
                                />
                            </div>
                        ) : noMoreProfiles ? (
                            <div className="text-center flex flex-col items-center justify-center max-w-md px-6 h-full">
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

                    {/* 
                      Like/Skip buttons - FIXED HEIGHT container so position never changes
                      Buttons only visible when we have a currentProfile and not loading
                    */}
                    <div className="h-20 flex items-center justify-center shrink-0 mt-4 sm:mt-6">
                        {currentProfile && !isLoading && !noMoreProfiles &&(
                            <div className="flex gap-6 sm:gap-8 md:gap-12">
                                <SkipButton 
                                    onClick={() => { if (!isActionInProgressRef.current) handleAction('skip'); }} 
                                    disabled={isActionInProgress} 
                                />
                                <LikeButton 
                                isLiked={false} 
                                onClick={() => { if (!isActionInProgressRef.current) handleAction('like'); }}
                                disabled={isActionInProgress}  
                                />
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
    );
};

export default MainPage;