'use client';

import { useState } from 'react';
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
    if (!Number.isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const clampedTime = Math.max(0, Math.min(currentTime, duration));
  const progress = duration > 0 ? (clampedTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm p-6 rounded-2xl shadow-md bg-white">
      {/* Circular Progress */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full bg-black flex items-center justify-center z-10">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            userInteracted={userInteracted}
            onUserStart={onUserStart}
          />
        </div>
        <CircularProgress currentTime={progress} />
      </div>

      {/* Title & Time */}
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
          {title}
        </h3>
        <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full animate-pulse mt-1 inline-block">
          LIVE
        </span>
        <div className="text-sm text-gray-600 mt-2">
          {formatTime(clampedTime)}
        </div>
      </div>

      {/* Active Users & Volume */}
      <div className="mt-4 flex items-center gap-4">
        Active : {activeUserCount || 0}
        <button
          onClick={() => setShowVolume((prev) => !prev)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
          >
          <FaVolumeUp className="text-gray-600 w-3 h-3" />
        </button>
          </div>

      {showVolume && (
        <div className="mt-6">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
          />
        </div>
      )}
    </div>
  );
}
