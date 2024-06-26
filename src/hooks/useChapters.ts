import useSWR from "swr"
import { ChangeEvent, useMemo, useState } from "react"

import { getChapters } from "@/actions/chapterActions"

export type ChapterResult = NonNullable<Awaited<ReturnType<typeof getChapters>>>

const fetcher = async (id: string) => {
  const contentId = id.split("|")[0]
  return getChapters({ contentId }, { orderBy: { createdAt: "desc" } })
}


export default function useChapters(contentId: string, fallbackData: ChapterResult = { total: 0, data: [] }) {
  const swrKey = `${contentId}|chapters`
  const [search, setSearch] = useState("")
  const { data, error, isLoading, mutate } = useSWR<ChapterResult>(swrKey, fetcher, { fallbackData })

  const onFilter = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value) {
      setSearch(event.currentTarget.value)
    } else {
      setSearch("")
    }
  }

  const filtered = useMemo(() => {
    if (!data) return []
    if (!search) return data.data
    return data.data.filter(({ title }) => title && title.indexOf(search) > -1)
  }, [search, data])

  return {
    mutate,
    onFilter,
    isLoading,
    isError: error,
    chapters: filtered,
    total: data?.total || 0,
  }
}
