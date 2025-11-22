import React from "react";
import logoImg from "../assets/images/logo.png";
import bgImg from "../assets/images/landing_bg.jpg";
import { useNavigate } from "react-router-dom";

const SeniorsClubLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-teal-900 flex flex-col">
      {/* Logo Section */}
      <div className="w-full bg-teal-800 py-8 flex justify-center">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-block">
            <div
              style={{ backgroundImage: `url(${logoImg})` }}
              className="h-48 w-32 bg-cover bg-center"
            ></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 relative">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImg})` }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-teal-900/40 via-teal-800/30 to-teal-900/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-4">
              Welcome to Senior's Club!
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              Find your soulmates
            </p>
          </div>

          {/* Action Cards */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-4xl w-full justify-center">
            {/* Login Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-w-[280px] hover:bg-black/50 transition-all">
              <p className="text-white text-lg mb-6 text-center">
                Already an
                <br />
                user?
              </p>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-3 px-8 py-3 bg-white/10 border-2 border-white text-white rounded-full hover:bg-white/20 transition-all text-lg font-medium"
              >
                Log in
                <div className="bg-white rounded-full p-1.5"></div>
              </button>
            </div>

            {/* Sign Up Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-w-[280px] hover:bg-black/50 transition-all">
              <p className="text-white text-lg mb-6 text-center">
                Sign up to get
                <br />
                started!
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center gap-3 px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all text-lg font-medium shadow-lg"
              >
                Sign up
                <div className="bg-white rounded-full p-1.5"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorsClubLanding;


