import useSWR from "swr";
import PlaylistRoutes from "../endpoint/playlist";
import fetcher from "../service/fetcher";

export default function usePlaylistDetails(id: string) {
    const { data, error, isLoading, mutate } = useSWR<any>(
    id ?`${PlaylistRoutes.view}/${id}` : null, // Only fetch if `id` is defined
    fetcher
  );
    return {
        playlist: data?.playlist || null,
        message: data?.message,
        isLoading,
        isError: !!error,
        mutate,
    };
}