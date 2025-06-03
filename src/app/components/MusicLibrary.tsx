"use client";

import React, { useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import API from "@/app/service/api";
import Songs from "../endpoint/songs";
import TrackList from "./TrackList";
import UploadModal from "./UploadModal";
import UploadProgress from "./UploadProgress";
import { useRouter } from "next/navigation";
import BpmDetector from "./BpmDetector";
import toast from "react-hot-toast";
import SearchBar from "./SearchBar";
import PlaylistDrawer from "./PlaylistDrawer";
import useSongs from "../hooks/useSongs";

interface Song {
  id: number;
  bpm: number;
  length: number;
  title: string;
  artist: string;
  file_url: string;
}

interface UploadProgress {
  id: number;
  title: string;
  progress: number;
}

export default function MusicLibrary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const router = useRouter();

 const apiUrl = useMemo(() => {
  const params = new URLSearchParams();
  if (selectedCategoryId) params.append("category_id", selectedCategoryId.toString());
  if (searchTerm) params.append("search", searchTerm);
  return `${Songs.list}?${params.toString()}`;
}, [selectedCategoryId, searchTerm]);

const { musicList, isLoading, isError, mutate } = useSongs(apiUrl);

  const selectedSongs = useMemo(() => {
    return musicList.filter((song: any) => selectedTracks.has(song.id));
  }, [musicList, selectedTracks]);

  const totalLengthInSeconds = useMemo(() => {
    return selectedSongs.reduce((acc: number, song:any) => {
      const [minutes, seconds] = song.length.split(":").map(Number);
      return acc + (minutes * 60 + seconds);
    }, 0);
  }, [selectedSongs]);
  

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hrs ${minutes} mins`;
  };

  const handleDelete = async (songId: number) => {
    try {
      const response = await API.delete(Songs.delete, { params: { id: songId } });
      if (response.status === 200) {
        toast.success(response.data.message);
        mutate();
      }
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const handleSearch = (term: string, categoryId: number | null) => {
    setSearchTerm(term);
    setSelectedCategoryId(categoryId);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategoryId(null);
  };

  const onDrop = async (acceptedFiles: File[], selectedCategory: number | null) => {
    const newProgress = acceptedFiles.map((file, index) => ({
      id: Date.now() + index,
      title: file.name,
      progress: 0,
    }));

    setIsModalOpen(false);
    setUploadProgress((prev) => [...prev, ...newProgress]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileObj = newProgress[i];

      try {
        const bpm = await BpmDetector(file);

        const formData = new FormData();
        formData.append("bpm", bpm.toString());
        formData.append("file", file);
        if (selectedCategory !== null) {
          formData.append("category_id", selectedCategory.toString());
        }

        await API.post(Songs.upload, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event: any) => {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress((prev) =>
              prev.map((track) =>
                track.id === fileObj.id ? { ...track, progress } : track
              )
            );
          },
        });

        setUploadProgress((prev) => prev.filter((track) => track.id !== fileObj.id));
        mutate();
      } catch (error: any) {
        setUploadProgress((prev) => prev.filter((track) => track.id !== fileObj.id));

        if (error) {
          const { message, song } = error.response.data;
          toast.error(`${message}: ${song}`);
        } 
        console.error("Upload error:", error);
      }
    }
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-3">
        <div className="col-1/3">
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Music Library</h1>
        </div>
        <div className="col-2/3">
        
      {selectedTracks.size > 0 && (
        <div className="flex items-center gap-4 mt-3">
          <div className="bg-black text-white px-3 py-1 rounded d">
            Playlist Length: {formatDuration(totalLengthInSeconds)}
          </div>
          <button
            className="bg-black hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => setIsDrawerOpen(true)}
          >
           Add Playlist
          </button>
        </div>
      )}
        </div>
      </div>


      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <SearchBar
            onSearch={handleSearch}
            onReset={handleReset}
            initialSearch={searchTerm}
          />
          <button
            className="bg-red-500 hover:bg-black px-1 text-white rounded"
            onClick={() => setIsModalOpen(true)}
          >
            Add Tracks
          </button>
          <button
            className="bg-red-500 hover:bg-black px-1 text-white rounded"
            onClick={() => router.push("/admin/category")}
          >
            Add Category
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading tracks...</p>
      ) : isError  ? (
        <p className="text-red-500">Failed to load music list.</p>
      ) : (
        <>
          <UploadProgress uploadProgress={uploadProgress} />
            <TrackList
              songs={musicList || []}
              selectedTracks={selectedTracks}
              toggleSelection={toggleTrackSelection}
              handleDelete={handleDelete}
            />
        </>
      )}

      {isModalOpen && (
        <UploadModal onDrop={onDrop} onClose={() => setIsModalOpen(false)} />
      )}

      <PlaylistDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        songs={selectedSongs}
        totalDuration={formatDuration(totalLengthInSeconds)}
      />
    </div>
  );
}
