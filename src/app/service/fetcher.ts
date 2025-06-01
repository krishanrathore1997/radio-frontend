import API from "./api";

const fetcher = <T>(url: string): Promise<T> =>
  API.get<T>(url).then((res) => res.data);

export default fetcher;
