import { useMemo } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  bpm?: number;
  length?: string; // e.g., "4:56"
  file_url: string;
}

interface UseScheduledStartTimesProps {
  songs?: Song[] | null;
  startTime?: string; // e.g., "09:00"
}

function parseLengthToSeconds(length?: string): number {
  if (!length) return 0;
  const [min, sec] = length.split(":").map(Number);
  return (min || 0) * 60 + (sec || 0);
}

export default function useScheduledStartTimes({
  songs = [],
  startTime = "09:00",
}: UseScheduledStartTimesProps): string[] {
  const scheduledStartSeconds = useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return [];

    const [hours, minutes] = startTime.split(":").map(Number);
    let currentTime = (hours || 0) * 3600 + (minutes || 0) * 60;

    return songs.map((song) => {
      const result = currentTime;
      currentTime += parseLengthToSeconds(song.length);
      return result;
    });
  }, [songs, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return scheduledStartSeconds.map(formatTime);
}
