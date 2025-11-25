import React from 'react';

interface AuthButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'login' | 'signup' | 'link';
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'login',
  className = '' 
}) => {
  // Simple text link for "back to home"
  if (variant === 'link') {
    return (
      <button
        onClick={onClick}
        className={`text-center text-white/80 hover:text-white transition-all ${className}`}
      >
        {children}
      </button>
    );
  }

  // Styled buttons for login/signup
  const baseStyles = "flex items-center gap-3 rounded-full transition-all text-lg font-medium";
  
  const variantStyles = {
    login: "bg-white/10 border-2 border-white text-white hover:bg-white/20",
    signup: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
      <div className="bg-white rounded-full p-1.5"></div>
    </button>
  );
};