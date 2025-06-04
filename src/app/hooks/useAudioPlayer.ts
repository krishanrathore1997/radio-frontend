import { useState, useEffect, useRef } from 'react';

type AudioPlayerConfig = {
  fileUrl: string;
  startedAt: number; // Unix timestamp in seconds
  duration: number;  // in seconds (can be 0 if live)
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
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // ⏱️ Sync currentTime from <audio> element
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current!.currentTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  // 🔊 Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 🔁 Handle onEnded event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (typeof options?.onEnded === 'function') {
        options.onEnded();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [options]);

  const handleUserStart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = Date.now() / 1000;
    const offset = Math.max(0, now - config.startedAt);
    audio.currentTime = offset;

    audio.volume = isMuted ? 0 : volume;
    audio
      .play()
      .then(() => {
        setUserInteracted(true);
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error('Audio play failed:', err);
      });
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
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
