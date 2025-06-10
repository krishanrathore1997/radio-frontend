import swr from "swr";
import scheduleRoute from "../endpoint/schedule";
import fetcher from "../service/fetcher";

export default function useSchedule() {
  const { data, error, isLoading, mutate } = swr<any>(
    scheduleRoute.list,
    fetcher
  );

  return {
    scheduleList: data?.list || [],  // ✅ Corrected variable name
    message: data?.message,
    isLoading,
    isError: !!error,
    mutate,
  };
}
