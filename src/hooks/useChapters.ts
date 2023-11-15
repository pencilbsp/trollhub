import useSWR from "swr";

import { XOR } from "@/types/utils";
import { ChapterList as IChapterList } from "@/actions/getContent";
import { getChapters } from "@/actions/chapterActions";

export type Chapter = Awaited<ReturnType<typeof getChapters>>;
type ChapterList = XOR<Chapter, IChapterList>;

const fetcher = (id: string) => getChapters(id, { orderBy: { createdAt: "desc" } });

export default function useChapters(contentId: string, fallbackData: ChapterList = []) {
  const { data, error, isLoading, mutate } = useSWR<ChapterList>(`${contentId}|chapters`, fetcher, {
    fallbackData,
    revalidateOnFocus: false,
  });

  return {
    mutate,
    isLoading,
    isError: error,
    chapters: data || [],
  };
}
