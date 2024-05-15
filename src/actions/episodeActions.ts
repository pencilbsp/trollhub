"use server"
import { ContentType, ChapterStatus } from "@prisma/client"

import prisma from "@/lib/prisma"
import getRedisClient from "@/lib/redis"
import { EPISODE_EX_TIME as EX_TIME } from "@/config"

const get = (id: string) =>
  prisma.chapter.findUnique({
    where: {
      id: id,
      type: ContentType.movie,
    },
    select: {
      id: true,
      fid: true,
      view: true,
      title: true,
      status: true,
      videoId: true,
      createdAt: true,
      updatedAt: true,
      content: {
        select: {
          id: true,
          type: true,
          title: true,
          thumbUrl: true,
          description: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
          userName: true,
        },
      },
    },
  })

export type EpisodeType = Awaited<ReturnType<typeof get>>

export async function getEpisode(id: string): Promise<EpisodeType> {
  try {
    const redisClient = await getRedisClient()
    const cachedEpisode = await redisClient.get(id)
    if (cachedEpisode) return JSON.parse(cachedEpisode)

    const episode = await get(id)
    if (!episode) throw new Error("notFound")

    const EX = episode.status === "ready" ? EX_TIME : 60
    await redisClient.set(id, JSON.stringify(episode), { EX })

    return episode
  } catch (error: any) {
    return null
  }
}
