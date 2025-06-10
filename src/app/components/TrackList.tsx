'use client';
import { Music } from "lucide-react";
import React, { useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { FaCirclePause, FaCirclePlay, FaMusic } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import CoverImage from "@/app/components/CoverImage"; // Assuming you have a CoverImage component

interface Song {
  id: number;
  bpm: number;
  length: number;
  title: string;
  artist: string;
  file_url: string;
  cover_image: string;
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
    // {
    //   name: "Select",
    //   cell: (row: Song) => (
    //     <input
    //       type="checkbox"
    //       checked={selectedTracks.has(row.id)}
    //       onChange={() => toggleSelection(row.id)}
    //       className="accent-red-500"
          
    //     />
    //     // <input
    //   ),
    //   width: "20px"
    // },
 // or any icon library you prefer

    {
      name: "",
      cell: (row: Song) => <CoverImage imageUrl={row.cover_image} />,
      className: "text-black-500",
      sortable: false,
      width: "100px",
    },
    {
      name: "Title",
      selector: (row: Song) => row.title.replace(/_/g, ' '),
      className: "text-black-500",
      sortable: true,
      width: "auto",
    },  
    {
      name: "Artist",
      selector: (row: Song) => row.artist || "-",
      className: "text-black-500",
      sortable: true,
      width: "200px",
    },
    {
      name: "Length",
      selector: (row: Song) => row.length || "-",
      className: "text-black-500",
      sortable: true,
      width: "100px",
    },
    {
      name: "BPM",
      selector: (row: Song) => row.bpm || "-",
      className: "text-black-500",
      sortable: true,
      width: "80px",
    },
    {
      name: "Action",
      cell: (row: Song) => (
        <div className="flex gap-2">
        <button
          onClick={() => handlePlayPause(row)}
          className="text-gray-500 hover:text-green-700 text-lg fsm-2"
        >
          {playingId === row.id ? <FaCirclePause /> : <FaCirclePlay />}
        </button>
        <button
          onClick={() => handleDelete(row.id)}  
          className="text-red-500 hover:text-red-700 text-lg"
        >
        <MdDelete size={20} />
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
