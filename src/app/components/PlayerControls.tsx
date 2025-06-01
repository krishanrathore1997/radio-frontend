'use client';
import { FaPlay, FaPause } from 'react-icons/fa';

interface PlayerControlsProps {
  userInteracted: boolean;
  isPlaying: boolean;
  onUserStart: () => void;
  onPlayPause: () => void;
}

export const PlayerControls = ({
  userInteracted,
  isPlaying,
  onUserStart,
  onPlayPause,
}: PlayerControlsProps) => {
  const handleClick = () => {
    if (!userInteracted) {
      onUserStart();
    }
    onPlayPause();
  };

  return (
    <button
      onClick={handleClick}
      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center focus:outline-none"
    >
      {isPlaying ? (
        <FaPause className="text-white w-6 h-6" />
      ) : (
        <FaPlay className="text-white w-6 h-6 ml-0.5" />
      )}
    </button>
  );
};
