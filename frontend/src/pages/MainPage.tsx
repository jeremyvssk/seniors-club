import React from 'react';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';


const MainPage: React.FC = () => {
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
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            {/* Profile Card */}
                            <ProfileCard
                                profile={{
                                    name: 'John Doe',
                                    age: '68',
                                    gender: 'male',
                                    bio: 'Loves hiking, reading, and spending time with family. Looking to make new friends and explore new adventures together!',
                                    location: 'New York, NY',
                                    hobbies: ['Hiking', 'Reading', 'Traveling'],
                                    lookingFor: 'Friend',
                                    profilePicture: null
                                }}
                            />
                             
                            {/* Action Buttons */}
                            <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center mt-2 mb-4 sm:mb-6">
                                <SkipButton
                                    onClick={() => console.log('Skip button clicked')}
                                />
                                <LikeButton
                                    isLiked={false}
                                    onClick={() => console.log('Like button clicked')}
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