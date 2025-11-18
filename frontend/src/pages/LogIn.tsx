import React, { useState } from "react";
import logoImg from '../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';

const SeniorsClubLogIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Email:', email);
        console.log('Password:', password);
      };

return (
    <div
    className="min-h-screen bg-center text-white p-10 relative flex items-center justify-center"
    style={{ backgroundImage: `url(${logoImg})` }}
  >
     <div className="absolute inset-0 bg-black/50"></div>

     <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md">
        <h2 className="text-3xl font-serif text-center mb-8">Log In</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                </label>
                <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your email"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                </label>
                <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus"
                placeholder="Enter your password"
                />
            </div>

            <button
                type="submit"
                className="w-full px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all text-lg font-medium shadow-lg"
                >
                    Log In
                </button>
        </form>

        <button
            onClick={() => navigate('/')}
            className="mt-6 w-full text-center text-white/80 hover:text-white transition-all"
            >
               👈 Back to home
            </button>

     </div>
     </div>
)}

export default SeniorsClubLogIn;