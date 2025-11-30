import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import HomeButton from "../components/HomeButton";
import LogInButton from "../components/LogInButton";
import Header from "../components/Header";

const SeniorsClubLogIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    // function that runs when login button is clicked
    const handleSubmit = async (e: React.FormEvent) => {
        // stops the form from refreshing the page
        e.preventDefault();
        try {
            // create a post request to /api/login
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // sends email and password to backend (JSON.stringify converts it to a string {email: madis@mail.ee, password:123})
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // stores JWT token in browsers localStorage atm
                localStorage.setItem('token', data.token);
                // same with id and email
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');
                // returns user to landing page atm, need to switch this when we have home page
                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Login failed');
        }
      };

          return (
              <div>
                  <Header />
                  <div
                      className="min-h-screen text-white p-10 relative flex flex-col items-center px-6 pt-4 pb-16"
                      style={{
                          background: "linear-gradient(to top, #C74815, #f8fafc )"
                      }}>
      
                      <div className="relative z-10 bg-white/55 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-md shadow-md">
                          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Log In</h2>
      
                          <form onSubmit={handleSubmit} className="space-y-6">
                              <div>
                                  <label htmlFor="email" className="block text-xl font-medium text-slate-500 mb-2">
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
                                  <label htmlFor="password" className="block text-xl font-medium text-slate-500 mb-2">
                                      Password
                                  </label>
                                  <input
                                      type="password"
                                      id="password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                      required
                                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-400 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
                                      placeholder="Enter your password"
                                  />
                              </div>
      
                              <LogInButton onClick={() => navigate('/')} className="py-4 text-xl mb-8" />
                          </form>
      
                          <div className="flex justify-center">
                              <HomeButton onClick={() => navigate('/')} className="text-xl"/>
                          </div>
                      </div>
                  </div>
              </div>
          )
      }
      
      export default SeniorsClubLogIn;