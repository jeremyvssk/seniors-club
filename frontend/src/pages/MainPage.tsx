import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';
import api from '../api/axios';
import { UserFormData } from '../types/User';

// Define animation states: 'left' = skip animation, 'right' = like animation, 'in' = fade in, null = no animation
type AnimationDirection = 'left' | 'right' | 'in' | null;

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Array of user IDs to show (e.g., [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const [recommendations, setRecommendations] = useState<number[]>([]);
    
    // Currently displayed profile data
    const [currentProfile, setCurrentProfile] = useState<UserFormData | null>(null);
    
    // Next profile preloaded in background for instant swipe
    const [nextProfile, setNextProfile] = useState<UserFormData | null>(null);
    
    // Show loading skeleton while fetching profile data
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    
    // Current animation being played (slide left/right, fade in)
    const [animationState, setAnimationState] = useState<AnimationDirection>(null);
    
    // Error message to show user if API calls fail
    const [error, setError] = useState<string | null>(null);
    
    // Position in recommendations array (0 = first profile, 1 = second, etc.)
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // True when auto-refreshing for more recommendations (shows "Looking for matches...")
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Prevents useEffect from loading profile multiple times for same batch
    // Using ref instead of state because changing it doesn't trigger re-render
    const hasLoadedProfile = useRef(false);
    
    // Store next batch of recommendations in background without displaying them yet
    const nextBatchRef = useRef<number[]>([]);

    // Effect 1: Run once when component mounts - fetch initial recommendations
    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Effect 2: When recommendations arrive, load first profile
    // Only runs once per batch due to hasLoadedProfile.current check
    useEffect(() => {
        // Check: Have recommendations AND at first index AND haven't loaded this batch yet
        if (recommendations.length > 0 && currentIndex === 0 && !hasLoadedProfile.current) {
            console.log('useEffect triggered - loading first profile');
            
            // Set flag to prevent re-running for same batch
            hasLoadedProfile.current = true;
            
            // Load profile at index 0
            loadProfile(0);
        }
    }, [recommendations, currentIndex]); // Re-run when recommendations or currentIndex changes

    // Fetch 10 user IDs from backend recommendation algorithm
    const fetchRecommendations = async (isBackgroundFetch = false) => {
        try {
            console.log('Fetching recommendations...');
            
            // API call: GET /api/recommendations
            const response = await api.get<number[]>('/recommendations');
            console.log('Got recommendations:', response.data);
            
            // Check if backend returned any user IDs
            if (response.data.length > 0) {
                if (isBackgroundFetch) {
                    // Store in ref without updating state (don't display yet)
                    console.log('Stored next batch in background:', response.data);
                    nextBatchRef.current = response.data;
                } else {
                    // Normal fetch - update state to display recommendations
                    setRecommendations(response.data);
                    setCurrentIndex(0);
                    setIsRefreshing(false);
                    hasLoadedProfile.current = false;
                }
            } else {
                // Backend returned empty array - no users available
                console.log('No recommendations available');
                if (!isBackgroundFetch) {
                    setRecommendations([]);
                    setIsRefreshing(false);
                    hasLoadedProfile.current = false;
                }
                nextBatchRef.current = [];
            }
        } catch (err: any) {
            // API call failed - log error and show message to user
            console.error('Failed to fetch recommendations:', err);
            setError('Failed to load recommendations');
            setIsRefreshing(false);
        }
    };

    // Load profile data for user at given index in recommendations array
    const loadProfile = async (index: number) => {
        // Guard clause: if index out of bounds, exit early
        if (index >= recommendations.length) return;

        // Show loading skeleton only if no profile is currently displayed
        // This prevents showing skeleton when preloading
        if (!currentProfile) {
            setIsLoadingProfile(true);
        }
        
        // Prepare fade-in animation
        setAnimationState('in');

        try {
            // Get user ID from recommendations array
            const userId = recommendations[index];
            console.log('Loading profile for user:', userId);
            
            // Make 3 API calls in parallel (faster than sequential)
            // 1. GET /api/users/{userId} - basic info (name, picture)
            // 2. GET /api/users/{userId}/profile - profile info (age, bio)
            // 3. GET /api/users/{userId}/bio - extended info (hobbies, looking for, location)
            const [userResponse, profileResponse, bioResponse] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/profile`),
                api.get(`/users/${userId}/bio`)
            ]);

            // Combine data from 3 API responses into one object
            const profile: UserFormData = {
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

            // Store profile in state - triggers re-render to show ProfileCard
            setCurrentProfile(profile);
            
            // Hide loading skeleton
            setIsLoadingProfile(false);

            // Preload next profile in background while user reads current one
            if (index + 1 < recommendations.length) {
                const nextUserId = recommendations[index + 1];
                console.log('Preloading next profile:', nextUserId);
                
                // Make same 3 API calls for next profile
                const [nextUser, nextProfile, nextBio] = await Promise.all([
                    api.get(`/users/${nextUserId}`),
                    api.get(`/users/${nextUserId}/profile`),
                    api.get(`/users/${nextUserId}/bio`)
                ]);

                // Combine next profile data
                const next: UserFormData = {
                    name: nextUser.data.name,
                    age: nextProfile.data.age.toString(),
                    gender: nextBio.data.gender,
                    bio: nextProfile.data.bio,
                    hobbies: nextBio.data.hobbies,
                    lookingFor: nextBio.data.lookingFor,
                    lookingForGender: nextBio.data.lookingForGender,
                    latitude: nextBio.data.latitude,
                    longitude: nextBio.data.longitude,
                    maxRadiusKm: nextBio.data.maxRadiusKm,
                    profilePicture: nextUser.data.profilePictureUrl || null
                };

                // Store preloaded profile - ready for instant swipe
                setNextProfile(next);
            } else {
                // Last profile in current batch -> start fetching next batch in background
                // Store in ref, don't display yet (user still viewing profile 10)
                // DON'T set isRefreshing here: user is still viewing the profile
                console.log('Last profile - fetching next batch in background');
                setNextProfile(null);
                fetchRecommendations(true); // Pass true to indicate background fetch
            }
        } catch (err: any) {
            // Profile loading failed - log error and show message
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile details');
            setIsLoadingProfile(false);
        }
    };

    // Handle like/skip button clicks
    const handleAction = async (actionType: 'like' | 'skip') => {
        // Prevent double-clicking while animation is playing
        if (animationState === 'left' || animationState === 'right') return;

        // Get ID of profile user is interacting with
        const currentUserId = recommendations[currentIndex];
        
        try {
            console.log(`${actionType} user:`, currentUserId);
            
            // Start exit animation: 'like' slides right, 'skip' slides left
            setAnimationState(actionType === 'like' ? 'right' : 'left');
            
            // Send like/skip action to backend
            // POST /api/{userId}/like or POST /api/{userId}/skip
            await api.post(`/${currentUserId}/${actionType}`);
            
            // Wait 300ms for exit animation to complete before showing next card
            setTimeout(() => {
                // Calculate next position in array
                const nextIndex = currentIndex + 1;
                
                // Check if there are more profiles in current batch
                if (nextIndex < recommendations.length) {
                    // Show preloaded profile instantly (no loading delay)
                    setCurrentProfile(nextProfile);
                    
                    // Update position
                    setCurrentIndex(nextIndex);
                    
                    // Start fade-in animation
                    setAnimationState('in');
                    
                    // Preload the profile after next one (always stay 1 ahead)
                    if (nextIndex + 1 < recommendations.length) {
                        loadProfile(nextIndex + 1);
                    }
                } else {
                    // User finished last profile in batch
                    console.log('Out of profiles in current batch');
                    
                    // Check if next batch was preloaded in background
                    if (nextBatchRef.current.length > 0) {
                        // Use preloaded batch - instant transition to next batch
                        console.log('Using preloaded batch:', nextBatchRef.current);
                        setRecommendations(nextBatchRef.current);
                        setCurrentIndex(0);
                        setCurrentProfile(null);
                        setNextProfile(null);
                        setIsRefreshing(false);
                        hasLoadedProfile.current = false;
                        nextBatchRef.current = []; // Clear used batch
                    } else {
                        // No preloaded batch - fetch now and show loading state
                        console.log('No preloaded batch - fetching now');
                        setCurrentProfile(null);
                        setNextProfile(null);
                        setRecommendations([]);
                        setCurrentIndex(0);
                        setIsRefreshing(true); // NOW set refreshing when user actually swipes
                        hasLoadedProfile.current = false;
                        fetchRecommendations();
                    }
                }
                
                // Clear animation state
                setAnimationState(null);
            }, 300);
        } catch (err) {
            // Like/skip API call failed - log error and show message
            console.error(`Failed to ${actionType}:`, err);
            setError(`Failed to ${actionType} profile`);
            setAnimationState(null);
        }
    };

    // Wrapper functions for button onClick handlers
    const handleLike = () => handleAction('like');
    const handleSkip = () => handleAction('skip');

    // Remove auth token and redirect to login page
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Convert animation state to CSS class name
    const getAnimationClass = () => {
        switch (animationState) {
            case 'left': return 'animate-slide-out-left';
            case 'right': return 'animate-slide-out-right';
            case 'in': return 'animate-fade-in';
            default: return '';
        }
    };

    // Main render
    return (
        <div className="h-screen overflow-hidden pb-16 md:pb-0"
            style={{ background: "linear-gradient(to top, #3b82f6, #f8fafc )" }}>
            
            {/* Logout button - fixed top right */}
            <div className="fixed top-4 right-3 sm:top-2 sm:right-3 md:top-4 md:right-4 z-50">
                <LogOutButton onClick={handleLogout} />
            </div>    
          
            <div className="flex h-screen">
                {/* Left sidebar */}
                <Sidebar />

                {/* Main content area */}
                <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl">
                        {/* Page title */}
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
                                Explore Profiles
                            </h1>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            {/* Profile card area */}
                            <div className="relative w-full flex justify-center min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[740px]">
                                {/* Conditional render based on state */}
                                {isLoadingProfile ? (
                                    // Loading skeleton shown while fetching profile data
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
                                    // Profile card with animation
                                    <div className={getAnimationClass()}>
                                        <ProfileCard profile={currentProfile} />
                                    </div>
                                ) : isRefreshing ? (
                                    // Looking for matches (auto-refresh in progress)
                                    <div className="text-center flex flex-col items-center justify-center max-w-md px-6">
                                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                            Looking for matches
                                        </h2>
                                        <p className="text-base md:text-lg text-gray-600 mb-4">
                                            Searching for compatible profiles nearby
                                        </p>
                                        {/* Three bouncing dots animation */}
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    // No recommendations available (truly empty)
                                    <div className="text-center flex flex-col items-center justify-center max-w-md px-6">
                                        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                            You've seen everyone nearby
                                        </h2>
                                        <p className="text-base md:text-lg text-gray-600 mb-2">
                                            Check back later for new profiles
                                        </p>
                                        <p className="text-sm md:text-base text-gray-500 italic">
                                            Or start chatting with your matches!
                                        </p>
                                    </div>
                                )}
                            </div>
                             
                            {/* Like/Skip buttons - only shown when profile is loaded and not loading */}
                            {currentProfile && !isLoadingProfile && (
                                <div className="flex gap-6 sm:gap-8 md:gap-12 justify-center">
                                    <SkipButton onClick={handleSkip} />
                                    <LikeButton isLiked={false} onClick={handleLike} />
                                </div>
                            )}
                        </div>

                        {/* Error toast - shown at bottom of screen when error exists */}
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