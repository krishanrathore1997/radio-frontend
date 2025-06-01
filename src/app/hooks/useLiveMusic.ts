// app/hooks/useLiveMusic.ts
import useSWR from "swr";
import generalRoutes from "../endpoint/general";
import fetcher from "../service/fetcher";

interface MusicResponse {
  title: string;
  file_url: string;
  started_at: number;
  duration: number;
}

const useLiveMusic = () => {
  const { data, error, isLoading, mutate } = useSWR<MusicResponse>(
    generalRoutes.music,
    fetcher,
    { refreshInterval: 10000 }
  );
  return {
    title: data?.title,
    fileUrl: data?.file_url,
    startedAt: data?.started_at,
    duration: data?.duration || 0,
    isLoading,
    isError: !!error,
    mutate,
  };
};

export default useLiveMusic;
