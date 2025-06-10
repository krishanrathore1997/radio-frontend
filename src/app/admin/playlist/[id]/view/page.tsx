"use client";

import PlaylistView from "@/app/components/PlaylistView";
import usePlaylistDetails from "@/app/hooks/usePlaylistDetails";
import { useParams } from "next/navigation";

type PlaylistType = {
  id: number;
  name: string;
  brand: string;
  songs: any[];
};

export default function PlaylistPage() {
  const { id } = useParams();
  const {
    playlist,
    isLoading,
    isError
  } = usePlaylistDetails(id as string);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !playlist) return <div>Failed to load playlist</div>;
  return   <PlaylistView
      playlist={playlist}
      onClose={() => {
        console.log("Playlist updated successfully");
        // You can add redirect logic here if needed
      }}
    />;

}
