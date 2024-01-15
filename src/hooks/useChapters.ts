import useSWR from "swr"

import { XOR } from "@/types/utils"
import { getChapters } from "@/actions/chapterActions"
import { ChapterList as IChapterList } from "@/actions/contentActions"

export type Chapter = Awaited<ReturnType<typeof getChapters>>
type ChapterList = XOR<Chapter, IChapterList>

const fetcher = async (id: string) => {
  const result = await getChapters({ contentId: id }, { orderBy: { createdAt: "desc" } })
  return result.data
}

export default function useChapters(contentId: string, fallbackData: ChapterList = []) {
  const { data, error, isLoading, mutate } = useSWR<ChapterList>(`${contentId}|chapters`, fetcher, {
    fallbackData,
    revalidateOnFocus: false,
  })

  return {
    mutate,
    isLoading,
    isError: error,
    chapters: data || [],
  }
}
