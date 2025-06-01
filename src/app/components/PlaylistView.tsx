'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaGripVertical, FaSearch, FaMusic, FaArrowLeft, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Song {
  id: number;
  title: string;
  artist: string;
  bpm?: number;
  length?: string; // length is string like "4:56"
  file_url: string;
}

interface PlaylistProps {
  id: number;
  name: string;
  songs: Song[];
  Brand?: string;
  start_time?: string; // Playlist level start time
  end_time?: string; // Playlist level start time
}

interface PlaylistViewProps {
  playlist: PlaylistProps;
  onBack: () => void;
  start_time?: string; // Optional external start_time prop for schedule
  end_time?: string; // Optional external start_time prop for schedule
}

// Convert length string "m:ss" to total seconds number
const parseLengthToSeconds = (length?: string): number => {
  if (!length) return 0;
  const parts = length.split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  if (isNaN(mins) || isNaN(secs)) return 0;
  return mins * 60 + secs;
};

// Format seconds to duration string "m:ss"
const formatDuration = (seconds?: number) => {
  if (seconds === undefined || seconds === null) return '-';
  if (isNaN(seconds) || seconds < 0) return '-';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

// Parse playlist start_time string like "HH:mm" or "HH:mm:ss" to total seconds from midnight
const parseStartTimeToSeconds = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parts.length === 3 ? parseInt(parts[2], 10) : 0;
  if ([h, m, s].some(v => isNaN(v) || v < 0)) return null;
  return h * 3600 + m * 60 + s;
};

// Format time in seconds from midnight to "HH:mm:ss" or "HH:mm" if seconds=0
const formatTimeFromSeconds = (totalSeconds: number): string => {
  totalSeconds = Math.floor(totalSeconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return s === 0 ? `${hh}:${mm}` : `${hh}:${mm}:${ss}`;
};

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlist, onBack, start_time , end_time}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const echoRef = useRef<any>(null);  // Reference to Echo instance

  const [playingId, setPlayingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [mounted, setMounted] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  // Use external start_time prop if passed, else playlist's start_time
  const playlistStartTimeStr = start_time || playlist.start_time || null;
  const playlistEndTimeStr = end_time || playlist.end_time || null;
  // Parse it to seconds or null
  const playlistStartSeconds = parseStartTimeToSeconds(playlistStartTimeStr);

  // Calculate scheduled start time for each song as absolute time (seconds from midnight)
  const calculateScheduledStartTimes = (songsArr: Song[]): number[] => {
    const startTimes: number[] = [];
    let total = playlistStartSeconds !== null ? playlistStartSeconds : 0;
    for (let i = 0; i < songsArr.length; i++) {
      startTimes.push(total);
      total += parseLengthToSeconds(songsArr[i].length);
    }
    return startTimes;
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredSongsScheduledStartTimes = calculateScheduledStartTimes(filteredSongs);

  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio();
    setSongs(playlist.songs || []);
    
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
  }, [playlist.songs]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const handlePlayPause = (song: Song) => {
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

  const columns = [
    {
      id: 'index',
      name: '#',
      cell: (row: Song, index: number) => (
        <div className="flex items-center justify-center w-8 h-8 text-sm text-gray-500">
          {playingId === row.id ? (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-green-500 animate-pulse" />
              <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
            index + 1
          )}
        </div>
      ),
      width: '48px',
    },
    {
      id: 'title',
      name: 'Title',
      cell: (row: Song) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium text-gray-900">{row.title.replace(/_/g, ' ')}</div>
            <div className="text-sm text-gray-500">{row.artist || 'Unknown Artist'}</div>
          </div>
        </div>
      ),
      width: '300px',
    },
    {
      id: 'startTime',
      name: 'Start Time',
      cell: (row: Song, index: number) => {
        const filteredSongsScheduledStartTimes = calculateScheduledStartTimes(filteredSongs);
        const songStartSeconds = filteredSongsScheduledStartTimes[index];
        return (
          <span className="text-gray-600">
            {playlistStartSeconds !== null ? formatTimeFromSeconds(songStartSeconds) : '-'}
          </span>
        );
      },
      width: '120px',
    },
    {
      id: 'length',
      name: 'Duration',
      cell: (row: Song) => (
        <span className="text-gray-600">{row.length || '-'}</span>
      ),
      width: '80px',
    },
    {
      id: 'bpm',
      name: 'BPM',
      cell: (row: Song) => (
        row.bpm ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {row.bpm} BPM
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
      width: '80px',
    },
  ];

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || !mounted) return;

    if (type === 'row') {
      const newSongs = [...songs];
      const [moved] = newSongs.splice(source.index, 1);
      newSongs.splice(destination.index, 0, moved);
      setSongs(newSongs);
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shadow-md bg-white rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{playlist.name}</h1>
              {playlistStartTimeStr && (
                <p className="text-gray-500 mt-1 text-sm">
                  Start Time: <span className="font-mono">{playlistStartTimeStr}</span> &nbsp;|&nbsp;
                  End Time: <span className="font-mono">{playlistEndTimeStr}</span>
                </p>
              )}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder="Search songs or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Now Playing Card */}
        {currentSong && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 shadow-lg flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full">
              <FaMusic size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {currentSong.title.replace(/_/g, ' ')}
              </h3>
              <p className="text-gray-600">{currentSong.artist || 'Unknown Artist'}</p>
              
              {/* Progress bar */}
              <div className="mt-3 space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => handleSeek([parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-3">
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

        {/* Playlist Content */}
        {filteredSongs.length > 0 ? (
          <div className="shadow-lg rounded-lg bg-white">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-2">
                <FaMusic className="text-green-500" />
                <h2 className="text-lg font-semibold">Tracks</h2>
              </div>
            </div>
            
            <div className="p-0">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="songs" type="row">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-white overflow-hidden"
                    >
                      {/* Table Header */}
                      <div className="flex items-center p-4 border-b bg-gray-50 font-medium select-none">
                        <div className="mr-4 w-8" />
                        {columns.map((col) => (
                          <div
                            key={col.id}
                            className="text-sm text-gray-700 flex-shrink-0"
                            style={{ width: col.width }}
                          >
                            {col.name}
                          </div>
                        ))}
                      </div>

                      {/* Table Rows */}
                      {filteredSongs.map((song, index) => (
                        <Draggable
                          key={song.id.toString()}
                          draggableId={song.id.toString()}
                          index={index}
                        >
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
                                className="mr-4 text-gray-400 hover:text-gray-600 cursor-grab w-8 flex-shrink-0"
                              >
                                <FaGripVertical />
                              </div>
                              
                              {columns.map((col) => (
                                <div
                                  key={col.id}
                                  className="flex-shrink-0"
                                  style={{ width: col.width }}
                                >
                                  {col.cell ? col.cell(song, index) : null}
                                </div>
                              ))}

                              {/* Play/Pause Button on Hover */}
                              {hoveredRowIndex === index && (
                                <button
                                  onClick={() => handlePlayPause(song)}
                                  className="ml-auto flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200"
                                  title={playingId === song.id ? 'Pause' : 'Play'}
                                >
                                  {playingId === song.id ? <FaPause size={12} /> : <FaPlay size={12} />}
                                </button>
                              )}
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
        ) : (
          <div className="text-center py-12 rounded-lg bg-white select-none">
            <FaMusic className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Songs Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'This playlist is empty'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistView;



