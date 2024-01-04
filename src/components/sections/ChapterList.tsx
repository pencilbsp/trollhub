"use client"

import slug from "slug"
import Link from "next/link"
import { useEffect, useRef } from "react"

import { cn, formatDate } from "@/lib/utils"
import { ChapterList } from "@/actions/contentActions"

interface Props {
  currentId: string
  contentTitle: string
  chapters: ChapterList
}

export default function ChapterList({ chapters, contentTitle, currentId }: Props) {
  const liRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (liRef.current) {
      const activeChap = liRef.current.querySelector("[data-active=true]")
      activeChap && activeChap.scrollIntoView({ block: "start", behavior: "smooth" })
    }
  }, [])

  return (
    <>
      <div className="m-4">
        <h4 className="font-bold text-xl uppercase">Danh sách chương</h4>
      </div>
      <div className="max-h-80 w-full overflow-y-auto mb-3">
        <ul className="px-3 w-full text-sm font-mono flex flex-col divide-y" ref={liRef}>
          {chapters.map((chap) => {
            const isCurrent = chap.id === currentId
            return (
              <li
                key={chap.id}
                data-active={isCurrent}
                className={cn(
                  "flex justify-between p-2 gap-x-4 hover:bg-foreground/10",
                  isCurrent && "bg-foreground/10 text-blue-500"
                )}
              >
                <Link className="truncate" href={`/chapter/${slug(contentTitle)}-${chap.id}`}>
                  {chap.title}
                </Link>
                <time className="font-mono font-light text-sm flex-shrink-0">{formatDate(chap.createdAt)}</time>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
