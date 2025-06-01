"use client";
import React, { useState } from 'react';
import API from '@/app/service/api';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import playlist from '../endpoint/playlist';

interface Song {
  id: number;
  title: string;
  artist: string;
  length: number;
}

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  totalDuration: string;
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isOpen, onClose, songs, totalDuration }) => {
  const [playlistName, setPlaylistName] = useState('');

  const handleSave = async () => {
    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name.');
      return;
    }

    try {
      const response = await API.post(playlist.add, {
        name: playlistName,
        song_ids: songs.map(song => song.id),
      });
      console.log(response);
      if (response.status === 200) {
        toast.success( response.data.message || 'Playlist saved successfully!');
        onClose();
        setPlaylistName('');
      } else {
        toast.error('Failed to save playlist.');
      }
    } catch (error) {
      toast.error('An error occurred while saving the playlist.');
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Create Playlist</h2>
          <button onClick={onClose} className="text-red-500 hover:text-gray-700"><FaTimes    /></button>
        </div>
        <input
          type="text"
          placeholder="Playlist Name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="mb-4 p-2 border rounded text-black"
        />
        <div className="flex-1 overflow-y-auto mb-4">
          {songs.length === 0 ? (
            <p className="text-gray-500">No songs selected.</p>
          ) : (
            <ul>
              {songs.map((song) => (
                <li key={song.id} className="mb-2">
                  <p className="font-bold text-gray-800 word-break bg-gray-100 p-1 rounded max-w-100">{song.title.replace(/_/g, ' ')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-auto">
          <p className="mb-2 text-red-500">Total Duration: {totalDuration}</p>
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDrawer;
