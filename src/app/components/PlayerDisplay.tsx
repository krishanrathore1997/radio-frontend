// PlayerDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { CircularProgress } from './CircularProgress';
import { VolumeControl } from './VolumeControl';
import { PlayerControls } from './PlayerControls';

interface PlayerDisplayProps {
  title: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeUserCount?: number;
  onPlayPause: () => void;
  volume?: number;
  isMuted?: boolean;
  handleVolumeChange?: (value: number[]) => void;
  toggleMute?: () => void;
  userInteracted?: boolean;
  onUserStart?: () => void;
}

export function PlayerDisplay({
  title,
  currentTime,
  duration,
  activeUserCount,
  isPlaying,
  onPlayPause,
  volume = 50,
  isMuted = false,
  handleVolumeChange = () => {},
  toggleMute = () => {},
  userInteracted = false,
  onUserStart = () => {},
}: PlayerDisplayProps) {
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clampedTime = Math.max(0, Math.min(currentTime, duration));
  const progress = duration > 0 ? (clampedTime / duration) * 100 : 0;

  const handleVolumeToggle = () => {
    setShowVolume((prev) => !prev);
  };

  useEffect(() => {
    if (isNaN(currentTime)) {
      console.warn('Invalid currentTime value:', currentTime);
    }
  }, [currentTime]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm p-6 rounded-2xl shadow-md bg-white">
      {/* Circular Progress with Controls */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full bg-black flex items-center justify-center shadow-xl z-10">
          <PlayerControls
            userInteracted={userInteracted}
            isPlaying={isPlaying}
            onUserStart={onUserStart}
            onPlayPause={onPlayPause}
          />
        </div>
        <CircularProgress currentTime={progress} />
      </div>

      {/* Track Info */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
          {title}
        </h3>
        <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full animate-pulse mt-1 inline-block">
          LIVE
        </span>
      </div>

      {/* Time and Volume Button */}
      <div className="mt-4 flex items-center gap-4">
        {/* <span className="text-3xl font-mono text-gray-700">
          {formatTime(clampedTime)} 
        </span> */}
        Active Users: {activeUserCount || 0}
        <button
          onClick={handleVolumeToggle}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
          aria-label="Toggle volume control"
        >
          <FaVolumeUp className="text-gray-600 w-5 h-5" />
        </button>
      </div>

      {/* Vertical Volume Control */}
      {showVolume && (
        <div className="mt-6 origin-center">
          <VolumeControl
  volume={volume} // 0 to 100
  isMuted={isMuted}
  onVolumeChange={handleVolumeChange}
  onToggleMute={toggleMute}
/>
        </div>
      )}
    </div>
  );
}