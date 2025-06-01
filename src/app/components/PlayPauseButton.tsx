import React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

interface Props {
  isPlaying: boolean;
}

const PlayPauseButton: React.FC<Props> = ({ isPlaying }) => {
  return isPlaying 
    ? <FaPause className="text-white" size={16} /> 
    : <FaPlay className="text-white" size={16} />;
};

export default PlayPauseButton;