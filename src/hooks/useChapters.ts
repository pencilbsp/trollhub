import useSWR from "swr";

import { getChapters } from "@/actions/chapterActions";

export type Chapter = Awaited<ReturnType<typeof getChapters>>;

const fetcher = (id: string) => getChapters(id, { orderBy: { createdAt: "desc" } });

export default function useChapters(contentId: string, fallbackData: Chapter = []) {
  const { data, error, isLoading, mutate } = useSWR(`${contentId}|chapters`, fetcher, {
    fallbackData,
    revalidateOnFocus: false,
  });

  return {
    mutate,
    isLoading,
    chapters: data,
    isError: error,
  };
}
