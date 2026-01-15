import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogOutButtonProps {
  onClick?: () => void;
}

const LogOutButton: React.FC<LogOutButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Call custom onClick handler if provided
    if (onClick) {
      onClick();
    }
    
    // Redirect to landing page
    navigate('/');
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2
                   px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2
                   text-xs sm:text-sm md:text-base 
                   font-medium text-red-600 hover:text-red-700 
                   bg-white/90 backdrop-blur-sm 
                   rounded-lg shadow-md hover:shadow-lg 
                   transition-all duration-300"
        aria-label="Log Out"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        <span className="hidden xs:inline sm:inline">Log Out</span>
      </button>

     
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-xl text-gray-800 font-bold mt-4 mb-6">
                Are you sure you want to log out?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 
                         text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 
                         text-white font-medium rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogOutButton;