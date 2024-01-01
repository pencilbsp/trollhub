"use client"

import slug from "slug"
import Link from "next/link"
import { useMemo } from "react"

import { ArrowRightIcon } from "lucide-react"

import { Button } from "./ui/Button"
import useChapters from "@/hooks/useChapters"

type Props = {
  chapterId: string
  contentId: string
  title: string | null
}

export default function NextChapter({ chapterId, title, contentId }: Props) {
  const { chapters } = useChapters(contentId)
  const nextChaper = useMemo(() => {
    const index = chapters.findIndex(({ id }) => id === chapterId)
    if (index < 0) return null

    const next = chapters[index - 1]
    if (!next) return null

    const href = `/chapter/${slug(next.title!)}-${next.id}`
    return { ...next, href }
  }, [chapters, chapterId])

  return (
    <div className="relative mx-auto mb-8 mt-4 flex gap-6 w-full max-w-[640px] flex-col items-center px-4 md:my-20 md:mt-12">
      <div aria-hidden="true" className="mx-auto h-32 w-[1px] bg-gradient-to-t from-blue-300 md:h-48" />
      <h3 className="text-2xl text-center font-bold mt-2">Hết chương: {title}</h3>

      {nextChaper && (
        <div className="border border-muted w-full flex flex-col items-center gap-3 rounded-xl px-4 py-8">
          <p className="text-center text-muted-foreground">Chương tiếp theo</p>
          <p className="text-center font-bold text-lg">{nextChaper.title}</p>

          <Button asChild className="flex items-center justify-center text-lg" size="lg">
            <Link href={nextChaper.href}>
              Đọc chương tiếp theo
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
