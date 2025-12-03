import React from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Headers/Header';
import exampleImg from '../assets/images/example.svg';
import LogInButton from "../components/Buttons/LogInButton";
import SignUpButton from "../components/Buttons/SignUpButton";

const SeniorsClubLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header  />
      <div className="min-h-screen flex flex-col items-center px-6 pt-4 pb-16"
              style={{
                background: "linear-gradient(to top, #3b82f6, #f8fafc )"
              }}>
        <div className="max-w-2xl w-full text-center">

          {/* Welcome message */}
          <h1 className="text-5xl text-slate-900 mb-6 font-bold">
            Welcome to Senior's Club!
          </h1>
          
          {/* Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column */}
            <div className="flex flex-col items-start justify-center lg:items-start text-left lg:text-left">
              {/* Text for Log in button */}
              <p className="text-xl md:text-xl text-slate-600 mb-1 font-light leading-relaxed">
                Already an user?
              </p>
              <LogInButton onClick={() => navigate('/login')} className="mb-4"/>
              <p className="text-xl md:text-xl text-slate-600 mb-1 font-light leading-relaxed">
                Join us!
              </p>
              <SignUpButton onClick={() => navigate('/signup')} />
            </div>

            {/* Right Column */}
            <div className="flex flex-col items-center justify-center">
              <img 
                src={exampleImg} 
                alt="Example" 
                className="max-w-md lg:max-w-xl w-full h-auto object-contain"
              />
              <p className="text-xl text-slate-50 font-medium mt-2">
                All your new friends are here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorsClubLanding;