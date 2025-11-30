import React from 'react';
import logoImg from '../assets/images/logo.svg';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-50 py-0 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <img 
          src={logoImg} 
          alt="Senior's Club Logo" 
          className="h-32 sm:h-20 md:h-24 lg:h-64 w-auto object-contain"
        />
      </div>
    </header>
  );
};

export default Header;