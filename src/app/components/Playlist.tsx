"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaMusic,
  FaClock,
  FaSave,
  FaHeadphones,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { MdPlaylistAdd, MdLibraryMusic } from "react-icons/md";
import { IoMusicalNotesOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import MusicListDrawer from "@/app/components/MusicListDrawer";
import API from "@/app/service/api";
import playlist from "../endpoint/playlist";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { FaGripVertical } from "react-icons/fa";
import { formatSecondsToHMS, formatSecondsToMinutes } from "@/lib/formatTime";
import CoverImage from "@/app/components/CoverImage";

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

// Helper function to convert time to 12-hour format
const formatTo12Hour = (time: string): string => {
  if (!time) return "12:00:00 AM";

  const parts = time.split(":");
  if (parts.length < 2) return time;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, "0");
  const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${period}`;
};

// Helper function to convert 12-hour time to 24-hour format
const convertTo24HourFormat = (timeStr: string): string => {
  if (!timeStr) return "00:00:00";

  // Check if it's already in 24-hour format (has no AM/PM)
  if (!timeStr.includes("AM") && !timeStr.includes("PM")) {
    return timeStr;
  }

  const [time, modifier] = timeStr.split(" ");
  if (!modifier) return timeStr; // If no AM/PM, return as-is

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
};

// Helper functions for duration formatting
const parseLengthToSeconds = (length?: string | number): number => {
  if (!length) return 0;

  if (typeof length === "number") {
    return length;
  }

  if (typeof length === "string") {
    // Handle both "mm:ss" and "HH:mm:ss" formats
    const parts = length.split(":");

    if (parts.length === 2) {
      // mm:ss format
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (isNaN(mins) || isNaN(secs)) return 0;
      return mins * 60 + secs;
    }

    if (parts.length === 3) {
      // HH:mm:ss format
      const hours = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      const secs = parseInt(parts[2], 10);
      if (isNaN(hours) || isNaN(mins) || isNaN(secs)) return 0;
      return hours * 3600 + mins * 60 + secs;
    }
  }

  return 0;
};

export default function Playlist({
  initialPlaylist,
  start_time,
  end_time,
  onSaveSuccess,
}: PlaylistProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlistId, setPlaylistId] = useState<number | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistSongs, setPlaylistSongs] = useState<
    (Music & { start_time?: string })[]
  >([]);
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

  // Convert start_time and end_time to 24-hour format for calculations
  const convertedStartTime = useMemo(
    () => (start_time ? convertTo24HourFormat(start_time) : "00:00:00"),
    [start_time]
  );

  const convertedEndTime = useMemo(
    () => (end_time ? convertTo24HourFormat(end_time) : ""),
    [end_time]
  );

  const hmsToSeconds = (hms: string): number => {
    const parts = hms.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const secondsToHMS = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const recalculateStartTimes = (
    baseStartTime: string,
    songs: Music[]
  ): (Music & { start_time: string })[] => {
    let current = hmsToSeconds(baseStartTime || "00:00:00");
    return songs.map((song) => {
      const start_time = secondsToHMS(current);
      current += parseLengthToSeconds(song.length);
      return { ...song, start_time };
    });
  };

  // Initialize form with playlist data if editing
  useEffect(() => {
    if (initialPlaylist) {
      setPlaylistId(initialPlaylist.id);
      setPlaylistName(initialPlaylist.name);
      const updatedSongs = recalculateStartTimes(
        convertedStartTime,
        initialPlaylist.songs
      );
      setPlaylistSongs(updatedSongs);
    } else {
      setPlaylistId(null);
      setPlaylistName("");
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
      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("ended", handleEnded);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("ended", handleEnded);
        audio.pause();
        audioRef.current = null;
      }
    };
  }, [initialPlaylist, convertedStartTime]);

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
      toast.error("Song already added to playlist");
      return;
    }
    const newSongs = [...playlistSongs, song];
    const updated = recalculateStartTimes(convertedStartTime, newSongs);
    setPlaylistSongs(updated);
    toast.success(`${song.title} added`);
  };

  const handleRemoveSong = (id: number) => {
    const filtered = playlistSongs.filter((s) => s.id !== id);
    const updated = recalculateStartTimes(convertedStartTime, filtered);
    setPlaylistSongs(updated);
    toast.success("Song removed");

    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      setCurrentSong(null);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name.");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      const payload = {
        name: playlistName,
        song_ids: playlistSongs.map((song) => song.id),
      };

      if (playlistId) {
        // Update existing playlist
        response = await API.post(`${playlist.update}/${playlistId}`, payload);
      } else {
        // Create new playlist
        response = await API.post(playlist.add, payload);
      }

      if (response.status === 200) {
        toast.success(
          response.data.message ||
            `Playlist ${playlistId ? "updated" : "saved"} successfully!`
        );

        // Reset form only for new playlists
        if (!playlistId) {
          setPlaylistName("");
          setPlaylistSongs([]);
        } else {
          // For updates, keep the playlist data but show success
        }

        // Notify parent component
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error(`Failed to ${playlistId ? "update" : "save"} playlist.`);
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${
          playlistId ? "updating" : "saving"
        } the playlist.`
      );
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

    const newSongs = recalculateStartTimes(convertedStartTime, updatedSongs);
    setPlaylistSongs(newSongs);
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
      audio
        .play()
        .then(() => setPlayingId(song.id))
        .catch((err) => console.error("Play error:", err));
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
                  {playlistId ? `Editing Playlist` : "Create New Playlist"}
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlus size={16} />
                {playlistSongs.length > 0
                  ? "Add More Songs"
                  : "Add Songs to Playlist"}
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
                  <IoMusicalNotesOutline
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <MdLibraryMusic className="text-blue-500" size={16} />
                    <span className="font-semibold text-blue-700">
                      {playlistSongs.length} Songs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                    <FaClock className="text-purple-500" size={16} />
                    <span className="font-semibold text-purple-700">
                      Length: {formatSecondsToHMS(totalLengthInSeconds)}
                    </span>
                  </div>
                  {start_time && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                      <FaClock className="text-purple-500" size={16} />
                      <span className="font-semibold text-purple-700">
                        Start time: {start_time}
                      </span>
                    </div>
                  )}
                  {end_time && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                      <FaClock className="text-purple-500" size={16} />
                      <span className="font-semibold text-purple-700">
                        End time: {end_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Now Playing Bar */}
              {currentSong && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 shadow-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    {currentSong.cover_image ? (
                      <img
                        src={currentSong.cover_image}
                        alt="Cover"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                        <FaMusic className="text-gray-500" />
                      </div>
                    )}

                    <button
                      onClick={() => handlePlayPause(currentSong)}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition"
                      title={playingId === currentSong.id ? "Pause" : "Play"}
                    >
                      {playingId === currentSong.id ? (
                        <FaPause size={14} />
                      ) : (
                        <FaPlay size={14} className="ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 w-full">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {currentSong.title.replace(/_/g, " ")}
                    </h3>
                    <p className="text-gray-600">
                      {currentSong.artist || "Unknown Artist"}
                    </p>

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
                        <span>{formatSecondsToMinutes(currentTime)}</span>
                        <span>{formatSecondsToMinutes(duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <button
                      onClick={toggleMute}
                      className="text-gray-600 hover:text-gray-800 transition"
                    >
                      {isMuted ? (
                        <FaVolumeMute size={20} />
                      ) : (
                        <FaVolumeUp size={20} />
                      )}
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No songs added yet
                  </h3>
                  <p className="text-gray-500">
                    Click "Add Songs to Playlist" to get started
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 overflow-hidden">
                  <div className="max-h-100 overflow-y-auto">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                      <Droppable droppableId="playlistSongs">
                        {(provided) => (
                          <table
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="min-w-full divide-y divide-gray-200"
                          >
                            {/* Table Header */}
                            <thead className="bg-gray-50">
                              <tr className="select-none">
                                <th className="w-5 px-1 py-3"></th>{" "}
                                {/* Drag handle column */}
                                <th className="w-25 px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Start Time
                                </th>
                                <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Song
                                </th>
                                <th className="w-30 px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                  Artist
                                </th>
                                <th className="w-16 px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                  BPM
                                </th>
                                <th className="w-16 px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="w-5 px-1 py-3"></th>{" "}
                                {/* Remove button column */}
                              </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="bg-white divide-y divide-gray-200">
                              {playlistSongs.map((song, index) => (
                                <Draggable
                                  key={song.id}
                                  draggableId={song.id.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`${
                                        snapshot.isDragging
                                          ? "bg-blue-50 shadow-lg rounded-lg"
                                          : "hover:bg-gray-50"
                                      } ${
                                        playingId === song.id
                                          ? "bg-blue-50"
                                          : ""
                                      } transition-all duration-200`}
                                      onMouseEnter={() =>
                                        setHoveredRowIndex(index)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredRowIndex(null)
                                      }
                                    >
                                      {/* Drag Handle Cell */}
                                      <td
                                        {...provided.dragHandleProps}
                                        className={`px-1 py-4 whitespace-nowrap transition-opacity duration-200 ${
                                          hoveredRowIndex === index
                                            ? "text-gray-600 opacity-100"
                                            : "text-gray-400 opacity-0 group-hover:opacity-100"
                                        } cursor-grab`}
                                      >
                                        <FaGripVertical />
                                      </td>

                                      {/* Start Time Cell */}
                                      {song.start_time && (
                                        <td className="px-1 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">
                                          {formatTo12Hour(song.start_time)}
                                        </td>
                                      )}

                                      {/* Song Info Cell */}
                                      <td className="px-1 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                            <CoverImage
                                              imageUrl={song.cover_image}
                                            />

                                            {/* Play/Pause Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayPause(song);
                                              }}
                                              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                                hoveredRowIndex === index ||
                                                playingId === song.id
                                                  ? "opacity-100 bg-black/30"
                                                  : "opacity-0"
                                              }`}
                                              title={
                                                playingId === song.id
                                                  ? "Pause"
                                                  : "Play"
                                              }
                                            >
                                              <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                                                  playingId === song.id
                                                    ? "bg-white/30 backdrop-blur-sm"
                                                    : "bg-purple-600"
                                                }`}
                                              >
                                                {playingId === song.id ? (
                                                  <FaPause
                                                    size={14}
                                                    className="text-white"
                                                  />
                                                ) : (
                                                  <FaPlay
                                                    size={12}
                                                    className="text-white ml-0.5"
                                                  />
                                                )}
                                              </div>
                                            </button>
                                          </div>

                                          <div className="min-w-0 max-w-[180px]">
                                            <div className="relative group">
                                              <p
                                                className={`font-medium truncate ${
                                                  playingId === song.id
                                                    ? "text-purple-600"
                                                    : "text-gray-900"
                                                }`}
                                              >
                                                {song.title.replace(/_/g, " ")}
                                              </p>
                                              {/* Song Title Tooltip */}
                                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                                                {song.title.replace(/_/g, " ")}
                                                <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Artist Cell */}
                                      <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                                        <div className="relative max-w-[120px] group">
                                          <span className="truncate block">
                                            {song.artist}
                                          </span>
                                          {/* Artist Name Tooltip */}
                                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                                            {song.artist}
                                            <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                                          </div>
                                        </div>
                                      </td>

                                      {/* BPM Cell */}
                                      <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                                        {song.bpm} BPM
                                      </td>

                                      {/* Duration Cell */}
                                      <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {typeof song.length === "string"
                                          ? song.length
                                          : formatSecondsToHMS(song.length)}
                                      </td>

                                      {/* Remove Button Cell */}
                                      <td className="px-1 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={() =>
                                            handleRemoveSong(song.id)
                                          }
                                          className="p-2 transition-all duration-200 rounded-full opacity-100 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                          title="Remove from playlist"
                                        >
                                          <FaTrash size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </tbody>
                          </table>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              )}

              <button
                onClick={handleSavePlaylist}
                disabled={
                  isLoading ||
                  !playlistName.trim() ||
                  playlistSongs.length === 0
                }
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {playlistId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <FaSave size={18} />
                    {playlistId ? "Update Playlist" : "Save Playlist"}
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
