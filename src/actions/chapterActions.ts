"use server";

import prisma from "@/lib/prisma";
import { comicParser, createComicURL, novelParser } from "@/lib/fuhu";

async function cloneImages(chapterId: string, fid: string) {
  try {
    const images = await comicParser(createComicURL(fid));
    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        images,
        status: "ready",
      },
    });

    return images;
  } catch (error) {
    return [];
  }
}

async function cloneText(chapterId: string, fid: string) {
  try {
    const text = await novelParser(createComicURL(fid));
    await prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        text,
        status: "ready",
      },
    });

    return text;
  } catch (error) {
    return "";
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
});

export async function getChapter(id: string) {
  try {
    const where = id.length !== 24 ? { fid: id } : { id };
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
    });

    if (!data) throw Error();

    if (data.type === "comic" && data.status === "pending") {
      data.images = await cloneImages(data.id, data.fid!);
    }

    if (data.type === "novel" && data.status === "pending") {
      data.text = await cloneText(data.id, data.fid!);
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function getChapters(
  contentId: string,
  options: any = { take: 12, skip: 0, orderBy: { createdAt: "desc" } }
) {
  contentId = contentId.split("|")[0];
  return prisma.chapter.findMany({
    where: {
      contentId,
    },
    ...chapterQuery(options),
  });
}
