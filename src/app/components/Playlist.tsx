'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaMusic, FaClock, FaSave, FaHeadphones, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { MdPlaylistAdd, MdLibraryMusic } from 'react-icons/md';
import { IoMusicalNotesOutline } from 'react-icons/io5';
import toast from "react-hot-toast";
import MusicListDrawer from '@/app/components/MusicListDrawer';
import API from '@/app/service/api';
import playlist from '../endpoint/playlist';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FaGripVertical } from 'react-icons/fa';
import { formatSecondsToHMS } from '@/lib/formatTime';
import { start } from 'repl';

type Music = {
  id: number;
  title: string;
  artist: string;
  bpm: string;
  cover_image?: string;
  length: string | number;
  file_url: string;
};

type Playlist = {
  id: number;
  name: string;
  songs: Music[];
};

type PlaylistProps = {
  initialPlaylist?: Playlist;
  start_time?: string;
  end_time?: string;
  onSaveSuccess?: () => void;
};

// Helper functions for duration formatting
const parseLengthToSeconds = (length?: string | number): number => {
  if (!length) return 0;
  
  if (typeof length === 'number') {
    return length;
  }
  
  if (typeof length === 'string') {
    const parts = length.split(':');
    if (parts.length !== 2) return 0;
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return 0;
    return mins * 60 + secs;
  }
  
  return 0;
};
export default function Playlist({ initialPlaylist,start_time, end_time, onSaveSuccess }: PlaylistProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlistId, setPlaylistId] = useState<number | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistSongs, setPlaylistSongs] = useState<Music[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Music player state
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSong, setCurrentSong] = useState<Music | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  // Initialize form with playlist data if editing
  useEffect(() => {
    if (initialPlaylist) {
      setPlaylistId(initialPlaylist.id);
      setPlaylistName(initialPlaylist.name);
      setPlaylistSongs(initialPlaylist.songs);
    } else {
      setPlaylistId(null);
      setPlaylistName('');
      setPlaylistSongs([]);
    }
    
    setMounted(true);
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const updateTime = () => audio && setCurrentTime(audio.currentTime);
    const updateDuration = () => audio && setDuration(audio.duration);
    const handleEnded = () => {
      setPlayingId(null);
      setCurrentSong(null);
      setCurrentTime(0);
    };

    if (audio) {
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audioRef.current = null;
      }
    };
  }, [initialPlaylist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const totalLengthInSeconds = useMemo(() => {
    return playlistSongs.reduce((acc: number, song: any) => {
      return acc + parseLengthToSeconds(song.length);
    }, 0);
  }, [playlistSongs]);

  const handleAddSongToPlaylist = (song: Music) => {
    if (playlistSongs.find((s) => s.id === song.id)) {
      toast.error('Song already added to playlist');
      return;
    }
    setPlaylistSongs((prev) => [...prev, song]);
    toast.success(`${song.title} added`);
  };

  const handleRemoveSong = (id: number) => {
    setPlaylistSongs((prev) => prev.filter((s) => s.id !== id));
    toast.success('Song removed from playlist');
    
    // If the removed song was playing, stop it
    if (playingId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      setCurrentSong(null);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name.');
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      const payload = {
        name: playlistName,
        song_ids: playlistSongs.map(song => song.id),
      };
      
      if (playlistId) {
        // Update existing playlist
        response = await API.post(`${playlist.update}/${playlistId}`, payload);
      } else {
        // Create new playlist
        response = await API.post(playlist.add, payload);
      }

      if (response.status === 200) {
        toast.success(response.data.message || `Playlist ${playlistId ? 'updated' : 'saved'} successfully!`);
        
        // Reset form only for new playlists
        if (!playlistId) {
          setPlaylistName('');
          setPlaylistSongs([]);
        } else {
          // For updates, keep the playlist data but show success
        }
        
        // Notify parent component
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error(`Failed to ${playlistId ? 'update' : 'save'} playlist.`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${playlistId ? 'updating' : 'saving'} the playlist.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const updatedSongs = Array.from(playlistSongs);
    const [movedSong] = updatedSongs.splice(source.index, 1);
    updatedSongs.splice(destination.index, 0, movedSong);

    setPlaylistSongs(updatedSongs);
  };

  const handlePlayPause = (song: Music) => {
    const audio = audioRef.current;
    if (!audio || !mounted) return;

    if (playingId === song.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId !== null) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.src = song.file_url;
      setCurrentSong(song);
      audio.play().then(() => setPlayingId(song.id)).catch(err => console.error('Play error:', err));
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white flex justify-between">
              <div className="flex items-center gap-3">
                <MdPlaylistAdd size={28} />
                <h2 className="text-2xl font-bold">
                  {playlistId ? `Editing Playlist` : 'Create New Playlist'}
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlus size={16} />
                {playlistSongs.length > 0 ? 'Add More Songs' : 'Add Songs to Playlist'}
              </button>
            </div>

            <div className="p-6">
              {/* Playlist Name Field - Always Visible */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Playlist Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your playlist name..."
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg"
                  />
                  <IoMusicalNotesOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <MdLibraryMusic className="text-blue-500" size={16} />
                    <span className="font-semibold text-blue-700">{playlistSongs.length} Songs</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <FaClock className="text-purple-500" size={16} />
                    <span className="font-semibold text-purple-700">Length: {formatSecondsToHMS(totalLengthInSeconds)}</span>
                  </div>
                  {start_time && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <FaClock className="text-purple-500" size={16} />
                    <span className="font-semibold text-purple-700">Start time: {start_time}</span>
                  </div>
                  )}
                  {end_time && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <FaClock className="text-purple-500" size={16} />
                    <span className="font-semibold text-purple-700">End time: {end_time}</span>
                  </div>
                  )}
                </div>
              </div>

              {/* Now Playing Bar */}
              {currentSong && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 shadow-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full flex-shrink-0">
                    <FaMusic size={20} />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {currentSong.title.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-gray-600">{currentSong.artist || 'Unknown Artist'}</p>
                    
                    {/* Progress bar */}
                    <div className="mt-3 space-y-2 w-full">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => handleSeek([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{formatSecondsToHMS(currentTime)}</span>
                        <span>{formatSecondsToHMS(duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <button
                      onClick={toggleMute}
                      className="text-gray-600 hover:text-gray-800 transition"
                    >
                      {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                    </button>
                    <div className="w-24 relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume[0]}
                        onChange={(e) => setVolume([parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                        {volume[0]}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {playlistSongs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <FaMusic className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No songs added yet</h3>
                  <p className="text-gray-500">Click "Add Songs to Playlist" to get started</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                      <Droppable droppableId="playlistSongs">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="bg-white overflow-hidden"
                          >
                            {/* Header Row */}
                            <div className="flex items-center p-4 border-b bg-gray-50 font-medium select-none">
                              <div className="w-10" /> {/* Drag handle placeholder */}
                              <div className="w-12 text-center">#</div>
                              <div className="flex-1 min-w-0">Song</div>
                              <div className="w-32 hidden sm:block">Artist</div>
                              <div className="w-20 hidden md:block">BPM</div>
                              <div className="w-24">Duration</div>
                              <div className="w-10" /> {/* Play button placeholder */}
                              <div className="w-10" /> {/* Remove button placeholder */}
                            </div>

                            {/* Song Rows */}
                            {playlistSongs.map((song, index) => (
                              <Draggable key={song.id} draggableId={song.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`group flex items-center p-4 border-b transition-colors ${
                                      snapshot.isDragging
                                        ? 'bg-blue-50 shadow-lg'
                                        : 'hover:bg-gray-50'
                                    }`}
                                    onMouseEnter={() => setHoveredRowIndex(index)}
                                    onMouseLeave={() => setHoveredRowIndex(null)}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 text-gray-400 hover:text-gray-600 cursor-grab w-8 flex-shrink-0"
                                    >
                                      <FaGripVertical />
                                    </div>
                                    
                                    <div className="w-12 text-center text-gray-500 font-medium">
                                      {playingId === song.id ? (
                                        <div className="flex space-x-1 justify-center">
                                          <div className="w-1 h-4 bg-green-500 animate-pulse" />
                                          <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                          <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                      ) : (
                                        index + 1
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3">
                                        {song.cover_image && (
                                          <img 
                                            src={song.cover_image} 
                                            alt={song.title}
                                            className="w-10 h-10 rounded-md object-cover"
                                          />
                                        )}
                                        <div>
                                          <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {song.title.replace(/_/g, ' ')}
                                          </p>
                                          <p className="text-sm text-gray-500 sm:hidden">{song.artist}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="w-32 text-gray-600 hidden sm:block">
                                      {song.artist}
                                    </div>
                                    
                                    <div className="w-20 text-gray-600 hidden md:block">
                                      {song.bpm}
                                    </div>
                                    
                                    <div className="w-24 text-gray-600">
                                      {typeof song.length === 'string' 
                                        ? song.length 
                                        : formatSecondsToHMS(song.length)}
                                    </div>
                                    
                                    {/* Play/Pause Button */}
                                    <div className="w-10 flex-shrink-0">
                                      {(hoveredRowIndex === index || playingId === song.id) && (
                                        <button
                                          onClick={() => handlePlayPause(song)}
                                          className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200"
                                          title={playingId === song.id ? 'Pause' : 'Play'}
                                        >
                                          {playingId === song.id ? <FaPause size={10} /> : <FaPlay size={10} className="ml-0.5" />}
                                        </button>
                                      )}
                                    </div>
                                    
                                    {/* Remove Button */}
                                    <div className="w-10 flex-shrink-0">
                                      <button
                                        onClick={() => handleRemoveSong(song.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-60"
                                        title="Remove from playlist"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              )}

              <button
                onClick={handleSavePlaylist}
                disabled={isLoading || !playlistName.trim() || playlistSongs.length === 0}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {playlistId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FaSave size={18} />
                    {playlistId ? 'Update Playlist' : 'Save Playlist'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <MusicListDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onAddSong={handleAddSongToPlaylist}
          playlistSongs={playlistSongs}
        />
      </div>
    </div>
  );
}