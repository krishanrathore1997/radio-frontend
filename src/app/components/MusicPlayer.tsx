// MusicPlayer.tsx
'use client';
import React from 'react';

interface MusicPlayerProps {
  currentSong: any;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  onEnd?: () => void;
}

const MusicPlayer = React.forwardRef<HTMLAudioElement, MusicPlayerProps>(
  ({ currentSong, isPlaying, setIsPlaying, onEnd }, ref) => {
    React.useEffect(() => {
      const audio = ref as React.MutableRefObject<HTMLAudioElement | null>;
      if (currentSong && audio.current) {
        audio.current.src = currentSong.fileUrl;
        if (isPlaying) {
          audio.current.play().catch(() => setIsPlaying(false));
        } else {
          audio.current.pause();
        }
      }
    }, [currentSong, isPlaying]);

    return <audio ref={ref} onEnded={onEnd} />;
  }
);

MusicPlayer.displayName = 'MusicPlayer';
export default MusicPlayer;