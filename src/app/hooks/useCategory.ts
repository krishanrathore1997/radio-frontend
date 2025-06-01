import useSWR from "swr";
import CategoryRoutes from "../endpoint/category";
import fetcher from "../service/fetcher";

interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  category: Category[];
  message: string;
}

const useCategory = () => {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
    CategoryRoutes.list,
    fetcher
  );

  return {
    categoryList: data?.category || [],
    message: data?.message,
    isLoading,
    isError: !!error,
    mutate,
  };
};

export default useCategory;
