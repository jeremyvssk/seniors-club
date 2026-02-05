interface ProfileSuccessProps {
  userName?: string;
}

const ProfileSuccess = ({ userName }: ProfileSuccessProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-t from-blue-500 to-slate-50 px-4">
      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
          }
          100% {
            stroke-dasharray: 50;
            stroke-dashoffset: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .animate-checkmark {
          animation: checkmark 1.2s ease-in-out 0.4s forwards;
        }
      `}</style>

      <div className="text-center max-w-md w-full">
        {/* Checkmark - single focal point */}
        <div className="mb-6">
          <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-scale-in">
            <svg 
              className="w-16 h-16 text-white animate-checkmark" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Text content - tighter grouping */}
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg">
            Profile Created!
          </h2>
          
          {userName && (
            <p className="text-2xl text-white/95 drop-shadow">
              Welcome, {userName}!
            </p>
          )}
          
          <p className="text-white/75 text-base drop-shadow pt-2">
            Finding your perfect matches...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSuccess;