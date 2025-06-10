import useSWR from "swr";
import ScheduleRoutes from "../endpoint/schedule";
import fetcher from "../service/fetcher";

export default function useScheduleDetails(id: string) {
    const { data, error, isLoading, mutate } = useSWR<any>(
    id ?`${ScheduleRoutes.view}/${id}` : null, // Only fetch if `id` is defined
    fetcher
  );
    return {
        playlist: data?.playlist || null,
        schedule_date: data?.schedule_date || null,
        start_time: data?.start_time || null,
        end_time: data?.end_time || null,
        message: data?.message,
        isLoading,
        isError: !!error,
        mutate,
    };
}