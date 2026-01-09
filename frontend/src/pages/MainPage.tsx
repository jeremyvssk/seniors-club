import React from 'react';
import Sidebar from '../components/sidebar/MainSidebar';
import ProfileCard from '../components/ProfileCard';
import LikeButton from '../components/buttons/LikeButton';
import SkipButton from '../components/buttons/SkipButton';
import LogOutButton from '../components/buttons/LogOutButton';

const MainPage: React.FC = () => {
    return (
        <div className="min-h-screen"
            style={{
                background: "linear-gradient(to top, #3b82f6, #f8fafc )"
            }}>

             {/* Logout Button - Top Right */}
            <div className="absolute top-4 right-4 z-10">
                <LogOutButton onClick={() => console.log('Logout clicked')} />
            </div>    
          
            
            <div className="flex min-h-screen">
                <div className="flex items-center p-2">
                    <Sidebar />
                </div>

                {/* Main content - centered */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-5xl">
                        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Explore Profiles</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-6 justify-items-center">
                            {/* Example Profile Cards */}
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
                             
                             <div className="flex gap-10 justify-center mt-4">
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