import { useState, useEffect, useRef } from 'react';

type AudioPlayerConfig = {
  fileUrl: string;
  startedAt: number; // Unix timestamp in seconds
  duration: number;
};

type UseAudioPlayerOptions = {
  onEnded?: () => void;
};

export const useAudioPlayer = (
  config: AudioPlayerConfig,
  options?: UseAudioPlayerOptions
) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // ⏱️ Periodically update currentTime for UI
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (audioRef.current) {
      interval = setInterval(() => {
        const now = Date.now() / 1000;
        const offset = Math.max(0, now - config.startedAt);
        setCurrentTime(offset);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [config.startedAt]);

  // 🔊 Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 🛑 onEnded handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      options?.onEnded?.();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [options]);

  // 🚀 Always play from real-time offset
  const calculateRealTimeOffset = () => {
    const now = Date.now() / 1000;
    return Math.max(0, now - config.startedAt);
  };

  const playFromRealTime = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const offset = calculateRealTimeOffset();
    audio.currentTime = offset;
    audio.volume = isMuted ? 0 : volume;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setUserInteracted(true);
      })
      .catch((err) => {
        console.error('Playback failed:', err);
      });
  };

  const handleUserStart = () => {
    playFromRealTime();
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playFromRealTime(); // ⬅ always sync to real-time, not last paused time
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return {
    audioRef,
    userInteracted,
    isPlaying,
    volume: Math.round(volume * 100),
    isMuted,
    currentTime,
    handleUserStart,
    handlePlayPause,
    handleVolumeChange,
    toggleMute,
    setIsPlaying,
  };
};
