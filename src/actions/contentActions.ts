"use server"

import prisma from "@/lib/prisma"
import getRedisClient, { getKeyWithNamespace } from "@/lib/redis"
import { INIT_CHAPTER, INIT_TAKE_CONTENT, METADATA_EX_TIME } from "@/config"

export type Content = NonNullable<Awaited<ReturnType<typeof get>>>
export type ChapterList = Content["chapter"]

const EX = Math.floor(METADATA_EX_TIME / 8)

const get = (where: any, contentWhere: any) =>
  prisma.content.findFirst({
    where,
    select: {
      id: true,
      title: true,
      thumbUrl: true,
      updatedAt: true,
      description: true,
      akaTitle: true,
      status: true,
      type: true,
      chapter: {
        skip: 0,
        take: INIT_CHAPTER,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          title: true,
          createdAt: true,
          mobileOnly: true,
        },
      },
      countries: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      totalChap: true,
      author: true,
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
          userName: true,
          contents: {
            where: contentWhere,
            select: {
              id: true,
              title: true,
              creator: true,
              thumbUrl: true,
              description: true,
              type: true,
              status: true,
              updatedAt: true,
            },
            take: INIT_TAKE_CONTENT,
            orderBy: {
              updatedAt: "asc",
            },
          },
        },
      },
      categories: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

export default async function getContent(id: string): Promise<Content | null> {
  try {
    const redisClient = await getRedisClient()
    const key = getKeyWithNamespace(id)
    let cachedContent: any = await redisClient.get(key)

    if (!cachedContent) {
      const where = id.length !== 24 ? { fid: id } : { id }
      const contentWhere = { [id.length !== 24 ? "fid" : "id"]: { notIn: [id] } }

      cachedContent = await get(where, contentWhere)
      if (!cachedContent) return null

      await redisClient.set(key, JSON.stringify(cachedContent), { EX })
    } else {
      cachedContent = JSON.parse(cachedContent)
    }

    return cachedContent
  } catch (error) {
    return null
  }
}

export const contentQuery = (options: any): any => ({
  select: {
    id: true,
    title: true,
    contents: {
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        creator: true,
        updatedAt: true,
        thumbUrl: true,
        description: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      ...options,
    },
  },
})

export async function getContentsByCategoryId(id: string, options = { take: INIT_TAKE_CONTENT, skip: 0 }) {
  return prisma.category.findUnique({ where: { id }, ...contentQuery(options) })
}

type Options = {
  skip?: number
  take?: number
  select?: { [key: string]: boolean }
}

export async function getContents(where: any, options: Options) {
  const total = await prisma.content.count({ where })
  const contents = await prisma.content.findMany({
    where,
    select: options.select ?? {
      id: true,
      type: true,
      title: true,
      thumbUrl: true,
      updatedAt: true,
      creator: {
        select: {
          name: true,
          avatar: true,
          userName: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: options.skip ?? 0,
    take: options.take ?? INIT_TAKE_CONTENT,
  })

  return { contents, total }
}
