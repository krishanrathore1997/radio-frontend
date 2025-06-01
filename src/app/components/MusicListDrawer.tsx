'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FaTimes, FaSearch, FaMusic, FaPlus, FaCheck } from 'react-icons/fa';
import { MdLibraryMusic, MdCampaign } from 'react-icons/md';
import { IoMusicalNotesOutline } from 'react-icons/io5';
import useSongs from '../hooks/useSongs';
import Songs from '../endpoint/songs';
import CategoryDropdown from './CategoryDropdown';
import PlayPauseButton from './PlayPauseButton';

interface MusicListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: any) => void;
  playlistSongs: any[];
}

const tabs = [
  { id: 'music', label: 'Music', icon: MdLibraryMusic },
  { id: 'ads', label: 'Ads', icon: MdCampaign },
];

const MusicListDrawer: React.FC<MusicListDrawerProps> = ({
  isOpen,
  onClose,
  onAddSong,
  playlistSongs,
}) => {
  const [selectedTab, setSelectedTab] = useState<'music' | 'ads'>('music');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId) params.append('category_id', selectedCategoryId.toString());
    if (searchTerm) params.append('search', searchTerm);
    return `${Songs.list}?${params.toString()}`;
  }, [selectedCategoryId, searchTerm]);

  const { musicList, isLoading, isError } = useSongs(apiUrl);

  const isSongInPlaylist = useMemo(
    () => (id: number) => playlistSongs.some((song) => song.id === id),
    [playlistSongs]
  );

  // Audio playback management
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!currentSong) return;
    
    // Set new audio source
    if (audio.src !== currentSong.file_url) {
      audio.src = currentSong.file_url;
      audio.load();
    }
    
    // Handle play/pause
    if (isPlaying) {
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
          console.error('Playback failed:', error);
          setIsPlaying(false);
        }
      };
      playAudio();
    } else {
      audio.pause();
    }
    
    // Cleanup on unmount
    return () => {
      audio.pause();
    };
  }, [currentSong, isPlaying]);

  // Handle song ending
  const handleEnded = () => {
    if (!currentSong) return;
    const currentIndex = musicList.findIndex((s: any) => s.id === currentSong.id);
    const nextSong = musicList[currentIndex + 1];
    
    if (nextSong) {
      setCurrentSong(nextSong);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Attach ended event listener
  useEffect(() => {
    const audio = audioRef.current;
    console.log(audio);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, musicList]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  const playSong = (song: any) => {
      if (currentSong?.id === song.id) {
          // Toggle play/pause for current song
          setIsPlaying(!isPlaying);
        } else {
            // Switch to new song and play
            setCurrentSong(song);
            audioRef.current.src = song.file_url;
            setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Backdrop */}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white shadow-2xl transform transition-all duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FaMusic size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Add Tracks</h2>
                <p className="text-purple-100 text-sm">Choose songs for your playlist</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTab(tab.id as 'music' | 'ads')}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        {selectedTab === 'music' && (
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search songs, artists, albums..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-1/2">
              <CategoryDropdown onCategoryChange={handleCategoryChange} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-240px)]">
          {selectedTab === 'music' ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <IoMusicalNotesOutline className="text-purple-500" size={18} />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Available Tracks ({musicList?.length || 0})
                </h3>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-3">
                        <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <FaMusic className="mx-auto text-red-300 mb-4" size={48} />
                  <p className="text-red-500 text-lg font-medium">Error loading songs</p>
                  <p className="text-gray-400 text-sm">Please try again later</p>
                </div>
              ) : !musicList || musicList.length === 0 ? (
                <div className="text-center py-12">
                  <FaMusic className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 text-lg font-medium">No songs found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {musicList.map((song: any) => {
                    const isInPlaylist = isSongInPlaylist(song.id);
                    const isCurrent = currentSong?.id === song.id;
                    
                    return (
                      <div
                        key={song.id}
                        className={`group bg-white border border-gray-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                          isCurrent ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="relative cursor-pointer"
                            onClick={() => playSong(song)}
                          >
                            <img
                              src={song.cover_image}
                              alt={song.title}
                              className="w-14 h-14 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <PlayPauseButton
                                isPlaying={isPlaying && isCurrent}
                              />
                            </div>
                          </div>

                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => playSong(song)}
                          >
                            <p className={`font-semibold truncate transition-colors ${
                              isCurrent ? 'text-purple-600' : 'text-gray-900 group-hover:text-purple-600'
                            }`}>
                              {song.title.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {song.length}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSong(song);
                            }}
                            disabled={isInPlaylist}
                            className={`p-3 rounded-full transition-all duration-200 ${
                              isInPlaylist
                                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:scale-110'
                            }`}
                            title={isInPlaylist ? "Already in playlist" : "Add to playlist"}
                          >
                            {isInPlaylist ? <FaCheck size={16} /> : <FaPlus size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center py-12">
              <MdCampaign className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Ads Available</h3>
              <p className="text-gray-500">Advertising content will appear here when available.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MusicListDrawer;