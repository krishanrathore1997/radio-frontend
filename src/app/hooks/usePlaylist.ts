import swr from "swr";
import PlaylistRoutes from "../endpoint/playlist";
import fetcher from "../service/fetcher";

export default function usePlaylist() {
    const { data, error, isLoading, mutate } = swr<any>(
        PlaylistRoutes.list,
        fetcher
    );

    return {
        playlistList: data?.playlists || [],
        message: data?.message,
        isLoading,
        isError: !!error,
        mutate,
    };
}