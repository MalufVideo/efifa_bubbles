import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-12">
        <h1 className="text-5xl font-bold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Live Message System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link 
            to="/admin"
            className="group relative block p-8 bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 transform hover:-translate-y-1"
          >
            <div className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300 bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Admin Panel</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Login required. Manage game themes, configure API sources, and control the broadcast stream.</p>
          </Link>

          <Link 
            to="/broadcast"
            className="group relative block p-8 bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 transform hover:-translate-y-1"
          >
            <div className="text-green-400 mb-6 group-hover:scale-110 transition-transform duration-300 bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Broadcast View</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Public access. View the live message bubble stream overlay. No login required.</p>
          </Link>
        </div>
        
        <p className="text-gray-600 text-sm mt-8">Select an option to proceed</p>
      </div>
    </div>
  );
};
