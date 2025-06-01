import swr from "swr";
import scheduleRoute from "../endpoint/schedule";
import fetcher from "../service/fetcher";

export default function useSchedule() {
    const { data, error, isLoading, mutate } = swr<any>(
        scheduleRoute.list,
        fetcher
    );

    return {
        scheduleplaylist: data?.playlist || null,
        message: data?.message,
        start_time: data?.start_time || null,
        end_time: data?.end_time || null,
        isLoading,
        isError: !!error,
        mutate,
    };
}