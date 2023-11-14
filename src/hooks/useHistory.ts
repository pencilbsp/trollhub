import useSWR from "swr";
import { useTransition } from "react";
import { getUserHistories, History, deleteHistory } from "@/actions/historyActions";

const fetcher = () => getUserHistories();

export default function useHistory(fallbackData: History[] = []) {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, error, mutate } = useSWR("history", fetcher, {
    fallbackData,
    revalidateOnFocus: false,
  });

  const removeHistory = (id: string) => {
    const list = [...(data || [])];
    const index = list.findIndex((c) => c.id === id);

    if (index > -1) {
      list.splice(index, 1);
      mutate([...list], { revalidate: false });

      if (!isPending) {
        startTransition(async () => {
          await deleteHistory(id);
        });
      }
    }
  };

  const upadteHistory = (history: History) => {
    let list = [...(data || [])];
    const index = list.findIndex((c) => c.id === history.id);

    if (index > -1) {
      list[index] = history;
      list = list.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      mutate([...list], { revalidate: false });
    } else {
      mutate([history, ...list], { revalidate: false });
    }
  };

  return {
    removeHistory,
    upadteHistory,
    isError: error,
    histories: data,
    isLoading: isLoading || isPending,
  };
}
