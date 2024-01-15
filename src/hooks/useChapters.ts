import useSWR from "swr"

import { XOR } from "@/types/utils"
import { getChapters } from "@/actions/chapterActions"
import { ChapterList as IChapterList } from "@/actions/contentActions"

export type Chapter = Awaited<ReturnType<typeof getChapters>>
type ChapterList = XOR<Chapter, IChapterList>

const fetcher = async (id: string) => {
  const chapterId = id.split("|")[0]
  const result = await getChapters({ chapterId }, { orderBy: { createdAt: "desc" } })
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
