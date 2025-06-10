'use client';

import { useEffect } from 'react';
import { FaMusic } from 'react-icons/fa';
import useLiveMusic from '../hooks/useLiveMusic';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PlayerDisplay } from './PlayerDisplay';

export default function NowPlaying() {
  const {
    title,
    fileUrl,
    startedAt,
    duration,
    activeUserCount,
    isLoading,
    isError,
    mutate, // ✅ get mutate from SWR hook
  } = useLiveMusic();

  const {
    audioRef,
    userInteracted,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    handleUserStart,
    handlePlayPause,
    handleVolumeChange,
    toggleMute,
    setIsPlaying,
  } = useAudioPlayer(
    {
      fileUrl: fileUrl || '',
      startedAt: startedAt || 0,
      duration: duration || 0,
    },
    {
      onEnded: () => {
        console.log('Song ended! Fetch next song.');
        mutate(); // ✅ Fetch next song
      },
    }
  );

  // ✅ Autoplay new song when fileUrl changes
  useEffect(() => {
    if (userInteracted && audioRef.current && fileUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Autoplay failed:', err));
    }
  }, [fileUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-8">
      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <FaMusic className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-semibold">Loading your music...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <FaMusic className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-red-600 text-lg font-semibold">Failed to load music</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page</p>
        </div>
      )}

      {!isLoading && !isError && title && fileUrl && (
        <div className="flex flex-col items-center w-full max-w-md space-y-6 bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
          <PlayerDisplay
            title={title}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            activeUserCount={activeUserCount}
            volume={volume}
            isMuted={isMuted}
            handleVolumeChange={handleVolumeChange}
            toggleMute={toggleMute}
            userInteracted={userInteracted}
            onPlayPause={userInteracted ? handlePlayPause : handleUserStart}
          />
          <audio ref={audioRef} src={fileUrl} style={{ display: 'none' }} />
        </div>
      )}

      {!isLoading && !isError && (!title || !fileUrl || startedAt == null) && (
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <FaMusic className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-red-600 text-center">No live music broadcast</h1>
          <p className="text-gray-500 text-sm text-center">Check back later for live streams</p>
        </div>
      )}
    </div>
  );
}
