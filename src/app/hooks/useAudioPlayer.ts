import { useState, useEffect, useRef } from "react";

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
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [userInteracted, setUserInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // 🕒 Seek based on live offset
  const seekToLiveOffset = () => {
    const audio = audioRef.current;
    const now = Date.now() / 1000;
    const offset = Math.max(0, now - config.startedAt);
    audio.currentTime = offset;
  };

  // 🔁 Sync current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 🔊 Volume
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 🛑 Ended event
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      options?.onEnded?.();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [options]);

  const handleUserStart = () => {
    const audio = audioRef.current;
    audio.src = config.fileUrl;

    audio.onloadedmetadata = () => {
      seekToLiveOffset();
      audio
        .play()
        .then(() => {
          setUserInteracted(true);
          setIsPlaying(true);
        })
        .catch(console.error);
    };
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = config.fileUrl;
      audio.onloadedmetadata = () => {
        seekToLiveOffset();
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      };

      // force reloading metadata if needed
      if (audio.readyState >= 1) {
        seekToLiveOffset();
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
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
