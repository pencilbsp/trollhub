"use server"
import { Metadata } from "next"

import prisma from "@/lib/prisma"
import { generateKeywords } from "@/lib/utils"
import { METADATA_EX_TIME, SITE_URL } from "@/config"
import getRedisClient, { getKeyWithNamespace } from "@/lib/redis"
import { comicParser, createComicURL, novelParser } from "@/lib/fuhu"

async function cloneImages(chapterId: string, fid: string) {
  try {
    const images = await comicParser(createComicURL(fid))
    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        images,
        status: "ready",
      },
    })

    return images
  } catch (error) {
    return []
  }
}

async function cloneText(chapterId: string, fid: string) {
  try {
    const text = await novelParser(createComicURL(fid))
    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        text,
        status: "ready",
      },
    })

    return text
  } catch (error) {
    return ""
  }
}

export const chapterQuery = (options: any): any => ({
  ...options,
  select: {
    id: true,
    type: true,
    title: true,
    status: true,
    createdAt: true,
    mobileOnly: true,
  },
})

export async function getChapter(id: string) {
  try {
    const where = id.length !== 24 ? { fid: id } : { id }
    const data = await prisma.chapter.findFirst({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!data) throw Error()

    if (data.type === "comic" && data.status === "pending") {
      data.images = await cloneImages(data.id, data.fid!)
    }

    if (data.type === "novel" && data.status === "pending") {
      data.text = await cloneText(data.id, data.fid!)
    }

    return data
  } catch (error) {
    return null
  }
}

export async function getChapters(
  contentId: string,
  options: any = { take: 12, skip: 0, orderBy: { createdAt: "desc" } }
) {
  contentId = contentId.split("|")[0]
  return prisma.chapter.findMany({
    where: {
      contentId,
    },
    ...chapterQuery(options),
  })
}

export async function getChapterMetadata(id: string): Promise<Metadata | null> {
  try {
    const redisClient = await getRedisClient()
    const key = getKeyWithNamespace(`${id}-metadata`)
    let cachedMetadata: any = await redisClient.get(key)
    if (!cachedMetadata) {
      const chapter = await prisma.chapter.findUnique({
        where: { id },
        select: {
          type: true,
          title: true,
          creator: {
            select: {
              name: true,
            },
          },
          content: {
            select: {
              title: true,
              thumbUrl: true,
              description: true,
            },
          },
        },
      })

      if (!chapter) return null

      const title = `${chapter.content.title} ${chapter.title}`
      let description = `Đọc truyện ${chapter?.content.title}`
      if (chapter.content.description) description += `: ${chapter.content.description.slice(0, 198)}`

      cachedMetadata = {
        title: title,
        description: description,
        keywords: generateKeywords(title, [], chapter.creator.name, chapter.type),
        openGraph: {
          title: title,
          locale: "vi_VN",
          description: description,
          siteName: SITE_URL.origin,
          images: { url: chapter.content.thumbUrl! },
          type: chapter.type === "movie" ? "video.movie" : "website",
        },
      }

      await redisClient.set(key, JSON.stringify(cachedMetadata), { EX: METADATA_EX_TIME })
    } else {
      cachedMetadata = JSON.parse(cachedMetadata)
    }

    return cachedMetadata as Metadata
  } catch (error) {
    return null
  }
}
