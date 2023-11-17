import useSWR from "swr";
import { useEffect, useRef, useTransition } from "react";
import { getUserHistories, HistoryData, deleteHistory, History } from "@/actions/historyActions";

const fetcher = (_: string) => getUserHistories();
const initialFallbackData: HistoryData = { histories: [], total: 0, loaded: false };

export default function useHistory(fallbackData: HistoryData = initialFallbackData) {
  const query = useRef({ skip: 0, take: 12 });
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, error, mutate } = useSWR("history", fetcher, {
    fallbackData,
    revalidateOnMount: false,
    revalidateOnFocus: false,
  });

  const removeHistory = (id: string) => {
    const histories = [...data.histories];
    const index = histories.findIndex((c) => c.id === id);

    if (index > -1) {
      histories.splice(index, 1);
      const total = data.total - 1;
      // @ts-ignore
      mutate({ ...data, total, histories }, { revalidate: false });

      if (!isPending) {
        startTransition(async () => {
          await deleteHistory(id);
        });
      }
    }
  };

  const upadteHistory = (history: History) => {
    let histories = [...data.histories];
    const index = histories.findIndex((c) => c.id === history.id);

    const total = data.total + 1;

    if (index > -1) {
      histories[index] = history;
      histories = histories.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      // @ts-ignore
      mutate({ ...data, total, histories }, { revalidate: false });
    } else {
      // @ts-ignore
      mutate({ ...data, total, histories: [history, ...data.histories] }, { revalidate: false });
    }
  };

  const loadMoreHistory = () => {
    if (!isLoading && !isPending) {
      startTransition(async () => {
        const options = query.current;
        query.current = { ...options, skip: data.histories.length };
        const history = await getUserHistories(query.current);
        mutate(
          // @ts-ignore
          { ...data, histories: [...data.histories, ...history.histories], total: history.total },
          { revalidate: false }
        );
      });
    }
  };

  useEffect(() => {
    if (!data.loaded && fallbackData.loaded) mutate(fallbackData, { revalidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    removeHistory,
    upadteHistory,
    isError: error,
    loadMoreHistory,
    total: data.total,
    histories: data.histories,
    isLoading: isLoading || isPending,
    hasMore: data.total > data.histories.length,
  };
}
