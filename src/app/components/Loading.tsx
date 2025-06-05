"use client";
import React from 'react';
import { Music } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading your music...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const barHeights = ['h-4', 'h-8', 'h-6', 'h-10', 'h-5', 'h-9', 'h-7'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Music icon with rotation */}
      <div className="relative mb-8">
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin`}>
          <Music className="w-6 h-6 text-white animate-pulse" />
        </div>
        
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-400 opacity-30 animate-ping"></div>
      </div>

      {/* Audio visualizer bars */}
      <div className="flex items-end space-x-1 mb-6">
        {barHeights.map((height, index) => (
          <div
            key={index}
            className={`w-2 ${height} bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse`}
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: '0.8s'
            }}
          ></div>
        ))}
      </div>

      {/* Loading message */}
      <p className={`text-white font-medium ${textSizeClasses[size]} animate-pulse mb-4`}>
        {message}
      </p>
      
      {/* Sound waves animation */}
      <div className="flex space-x-1">
        {[1, 2, 3].map((wave) => (
          <div
            key={wave}
            className="w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-70"
            style={{ 
              animationDelay: `${wave * 0.2}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-gray-700 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Loading;