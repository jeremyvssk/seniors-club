import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpButton from "../components/buttons/SignUpButton";
import HomeButton from "../components/buttons/HomeButton";
import Header from "../components/headers/Header";
import api from "../api/axios";

const SeniorsClubSignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setrepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle signup logic here, checks if passwords match

    const repeatInput = e.currentTarget.repeatpassword as HTMLInputElement;

    if (password !== repeatPassword) {
      repeatInput.setCustomValidity("Passwords do not match"); //browser needs to validate that passwords match to submit
      repeatInput.reportValidity(); //gives a popup that this field needs to be filled.
      return;
    } else {
      repeatInput.setCustomValidity(""); //if match, all good and clears error.
    }

    setLoading(true);
    try {
      const response = await api.post('/signup', {
        email,
        password
      });

      // Success! Redirect to login
      console.log("User created:", response.data);
      navigate("/complete-profile"); // if not, set profile up
      

    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        setError(error.response.data.message || "Sign up failed");
      } else if (error.request) {
        // Request made but no response
        setError("Network error. Please try again.");
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div>
      <Header />
      <div
        className="min-h-screen text-white p-10 relative flex flex-col items-center px-6 pt-4 pb-16" 
        style={{
          background: "linear-gradient(to top, #3b82f6, #f8fafc )"
        }}>
      
        <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Sign up</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xl text-slate-500 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xl text-slate-500 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus-blakc/50"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xl text-slate-500 font-medium mb-2"
              >
                Repeat Password
              </label>

              <input
                type="password"
                id="repeatpassword"
                value={repeatPassword}
                onChange={(e) => setrepeatPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus-black/50"
                placeholder="Repeat your password"
              />
            </div>

            <SignUpButton onClick={() => navigate('/')} className="py-4 text-xl mb-8"/>
          </form>

          <div className="flex justify-center">
            <HomeButton onClick={() => navigate('/')} className="text-xl"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorsClubSignUp;