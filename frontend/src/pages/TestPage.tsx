import React from 'react';
import Header from '../components/headers/Header';
import CreateUser from '../components/create-user';

const TestPage: React.FC = () => {
  return (
    <div>
      <Header />
      <div 
        className="min-h-screen text-black p-10 relative flex flex-col items-center px-6 pt-4 pb-16"
        style={{
          background: "linear-gradient(to top, #3b82f6, #f8fafc)"
        }}
      >
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-slate-900 text-center mb-8">
            Create Your Profile
          </h1>
          <div className="flex justify-center mb-8">
            <CreateUser />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;