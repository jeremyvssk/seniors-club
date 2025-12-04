import React from "react";
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import HomeButton from "../components/buttons/HomeButton";
import LogInButton from "../components/buttons/LogInButton";
import Header from "../components/headers/Header";

type LogInFields = {
    email: string;
    password: string;
};

const SeniorsClubLogIn: React.FC = () => {
    const navigate = useNavigate();
    const { 
        register,
        handleSubmit, 
        formState: { errors, isSubmitting },
        setError
    } = useForm<LogInFields>(); 

    const onSubmit: SubmitHandler<LogInFields> = async (data) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            const responseData = await response.json();

            if (response.ok) {
                localStorage.setItem('token', responseData.token);
                localStorage.setItem('user', JSON.stringify(responseData.user));
                alert('Login successful!');
                navigate('/');
            } else {
                setError('root', {
                    message: responseData.message || 'Login failed'
                });
            }
        } catch (error) {
            setError('root', {
                message: 'Network error. Please try again.'
            });
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
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Log In</h2>

                    {errors.root && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-700 text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xl font-medium text-slate-500 mb-2">
                                Email
                            </label>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: { 
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                                        message: "Invalid email address" 
                                    },
                                })}
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-500 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <div className="text-red-600 text-sm mt-1">{errors.email.message}</div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xl font-medium text-slate-500 mb-2">
                                Password
                            </label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { 
                                        value: 6, 
                                        message: "Password must be at least 6 characters long" 
                                    },
                                })}
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-slate-400 text-slate-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-black/50"
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <div className="text-red-600 text-sm mt-1">{errors.password.message}</div>
                            )}
                        </div>

                        <LogInButton 
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="py-4 text-xl"
                        />
                    </form>

                    <div className="flex justify-center mt-6">
                        <HomeButton onClick={() => navigate('/')} className="text-xl"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeniorsClubLogIn;