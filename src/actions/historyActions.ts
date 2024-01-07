"use server"

import { getServerSession } from "next-auth"

import prisma from "@/lib/prisma"
import { ArrayElement } from "@/types/utils"

import { ADULT_CATEGORY_ID } from "@/config"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export type HistoryData = Awaited<ReturnType<typeof getUserHistories>>
export type History = ArrayElement<HistoryData["histories"]>

const select = {
  id: true,
  updatedAt: true,
  content: {
    select: {
      id: true,
      type: true,
      title: true,
      thumbUrl: true,
      categoryIds: true,
    },
  },
  chapter: {
    select: {
      id: true,
      title: true,
    },
  },
}

type Options = {
  skip?: number
  take?: number
}

export async function getUserHistories(options: Options = {}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error()

    const [histories, total] = await Promise.all([
      prisma.history.findMany({
        where: {
          userId: session.user.id,
        },
        take: 12,
        ...options,
        orderBy: {
          updatedAt: "desc",
        },
        select,
      }),
      prisma.history.count({
        where: {
          userId: session.user.id,
        },
      }),
    ])

    return {
      histories: histories.map((data) => {
        const adultContent = data.content.categoryIds.includes(ADULT_CATEGORY_ID)
        return { ...data, content: { ...data.content, adultContent, categoryIds: undefined } }
      }),
      total,
      loaded: true,
    }
  } catch (error: any) {
    return { histories: [], total: 0, error: { message: error.message as string } }
  }
}

export async function createHistory(contentId: string, chapterId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error("Tính năng lưu lịch sử yêu cầu đăng nhập")

    const [history] = await Promise.all([
      prisma.history.upsert({
        where: {
          userId_contentId: {
            contentId,
            userId: session.user.id,
          },
        },
        create: {
          chapterId,
          contentId,
          userId: session.user.id,
        },
        update: {
          chapterId,
        },
        select,
      }),
      prisma.chapter.update({
        where: {
          id: chapterId,
        },
        data: {
          view: {
            increment: 1,
          },
        },
      }),
    ])

    return { history }
  } catch (error: any) {
    return { error: { message: error.message as string } }
  }
}

export async function deleteHistory(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error("Tính năng xoá lịch sử yêu cầu đăng nhập")

    await prisma.history.delete({
      where: {
        id,
      },
    })
  } catch (error: any) {
    return { error: { message: error.message as string } }
  }
}
