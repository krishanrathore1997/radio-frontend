'use client';
import React, { useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaPlay, FaPause,FaTrash } from "react-icons/fa";

interface Song {
  id: number;
  bpm: number;
  length: number;
  title: string;
  artist: string;
  file_url: string;
}

interface TrackListProps {
  songs: Song[];
  selectedTracks: Set<number>;
  toggleSelection: (id: number) => void;
  handleDelete: (id: number) => void; 
}

const TrackList: React.FC<TrackListProps> = ({
  songs = [],
  selectedTracks,
  toggleSelection,
  handleDelete,
}) => {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const handlePlayPause = (song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === song.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId !== null) {
        audio.pause();
      }

      audio.src = song.file_url;
      audio
        .play()
        .then(() => {
          setPlayingId(song.id);
        })
        .catch((err) => {
          console.error("Playback error:", err);
        });
    }
  };

  const columns = [
    {
      name: "Select",
      cell: (row: Song) => (
        <input
          type="checkbox"
          checked={selectedTracks.has(row.id)}
          onChange={() => toggleSelection(row.id)}
          className="accent-red-500"
          
        />
      ),
      width: "20px"
    },
    {
      name: "Title",
      selector: (row: Song) => row.title.replace(/_/g, ' '),
      sortable: true,
      width: "400px",
    },  
    {
      name: "Artist",
      selector: (row: Song) => row.artist || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Length",
      selector: (row: Song) => row.length || "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "BPM",
      selector: (row: Song) => row.bpm || "-",
      sortable: true,
      width: "80px",
    },
    {
      name: "Action",
      cell: (row: Song) => (
        <div className="flex gap-2">
        <button
          onClick={() => handlePlayPause(row)}
          className="text-red-500 hover:text-red-700 text-lg"
        >
          {playingId === row.id ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={() => handleDelete(row.id)}
          className="text-red-500 hover:text-red-700 text-lg"
        >
          <FaTrash />
        </button>
      </div>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="mt-6">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} hidden />

      <DataTable
        columns={columns}
        data={songs}
        pagination
        highlightOnHover
        persistTableHead
        customStyles={{
          headCells: {
            style: {
              fontWeight: "bold",
              backgroundColor: "#f8f8f8",
              color: "#333",
            },
          },
        }}
      />
    </div>
  );
};

export default TrackList;
