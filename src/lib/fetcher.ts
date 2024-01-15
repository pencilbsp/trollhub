"use client"

import { PaginationState } from "@tanstack/react-table"

import { chaptersMapTable } from "./utils"
import { getChapters } from "@/actions/chapterActions"

export const chaptersFetcher = async ({ pageSize, pageIndex }: PaginationState) => {
  const chapter = await getChapters(
    {},
    {
      select: {
        id: true,
        fid: true,
        title: true,
        type: true,
        status: true,
        mobileOnly: true,
        content: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      take: pageSize,
      skip: pageSize * pageIndex,
    }
  )
  return { ...chapter, data: chaptersMapTable(chapter.data) }
}
