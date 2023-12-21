"use client"

import useSWR from "swr"
import { useEffect, useTransition } from "react"
import { useInView } from "react-intersection-observer"

import SpinerIcon from "../icons/SpinerIcon"
import { INIT_TAKE_CONTENT } from "@/config"
import ContentCard, { ContentWithCreator } from "../ContentCard"
import { getContentsByCategoryId } from "@/actions/contentActions"

interface Props {
  id: string
  contents: ContentWithCreator[]
}

interface LoadMoreContentProps {
  id: string
  skip?: number
}

const fallbackData = { contents: [], take: INIT_TAKE_CONTENT, page: 1, hasMore: true }
const fetcher = async (id: string) => {
  const searchParams = new URLSearchParams(id)
  const page = Number(searchParams.get("page") || fallbackData.page)
  const take = Number(searchParams.get("take") || fallbackData.take)
  const category: any = await getContentsByCategoryId(id, { take, skip: page * take })
  const contents = category?.contents || []
  return { contents, take, page, hasMore: contents.length > 0 }
}

function LoadMoreContent({ id }: LoadMoreContentProps) {
  const { ref, inView } = useInView()
  const {
    data: { contents, hasMore, take, page },
    mutate,
  } = useSWR(id, fetcher, { fallbackData, revalidateOnFocus: false })

  const [isPending, startTransition] = useTransition()

  const loadContents = async () => {
    const nextPage = page + 1
    const category: any = await getContentsByCategoryId(id, { take, skip: take * nextPage })
    if (category && category.contents.length > 0) {
      const hasMore = category.contents.length === INIT_TAKE_CONTENT
      mutate({ contents: [...contents, ...category.contents], page: nextPage, take, hasMore }, { revalidate: false })
    } else {
      mutate({ contents, page, take, hasMore: false }, { revalidate: false })
    }
  }

  useEffect(() => {
    if (inView && hasMore && !isPending) {
      startTransition(() => loadContents())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <>
      {contents &&
        contents.map((content: any) => {
          // @ts-ignore
          return <ContentCard key={content.id} direction="horizontal" data={content} />
        })}
      {hasMore && (
        <div ref={ref} className="">
          <div className="flex items-center justify-center text-blue-600">
            <SpinerIcon />
            <span className="ml-2 text-lg">Đang tải thêm...</span>
          </div>
        </div>
      )}
    </>
  )
}

export default function CategoryContents({ contents, id }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {contents &&
        contents.map((content) => (
          // @ts-ignore
          <ContentCard key={content.id} direction="horizontal" data={content} />
        ))}
      <LoadMoreContent id={id} />
    </div>
  )
}
