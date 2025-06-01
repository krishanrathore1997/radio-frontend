// hooks/useSongs.ts
import useSWR from "swr";
import fetcher from "../service/fetcher";


const useSongs = (url: string) => {
  const { data, error, isLoading, mutate } = useSWR<any>(
    url,
    fetcher
  );

  return {
    musicList: data?.songs || [], // <-- CamelCase here
    message: data?.message,
    isLoading,
    isError: !!error,
    mutate,
  };
};


export default useSongs;
