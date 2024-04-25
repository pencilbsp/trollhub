"use server";

import prisma from "@/lib/prisma";
import { USER_CONTENTS_HOST } from "@/config";
import { getChapter } from "./chapterActions";
import {
  COMIC_VERSION,
  comicParser,
  createEmbedUrl,
  novelParser,
} from "@/lib/fuhu";

async function cloneText(chapterId: string, fid: string) {
  const text = await novelParser(createEmbedUrl(fid, COMIC_VERSION));
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
}

export async function getImages(
  chapter: NonNullable<Awaited<ReturnType<typeof getChapter>>>
): Promise<string[]> {
  try {
    if (chapter.type === "novel") {
      if (chapter.status === "pending") {
        chapter.text = await cloneText(chapter.id, chapter.fid!);
        chapter.status = "ready";
      }

      return chapter.text ? [chapter.text] : [];
    }

    const url = `${USER_CONTENTS_HOST}/api/fttps:webp/${chapter.fid}`;
    const response = await fetch(url, { cache: "no-cache" });
    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      chapter.images = await comicParser(
        createEmbedUrl(chapter.fid!, COMIC_VERSION)
      );

      await prisma.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          status: "ready",
          images: chapter.images,
        },
      });
    } else {
      return data.images.map(
        (i: string) => `${USER_CONTENTS_HOST}/images/${chapter.fid}/${i}`
      );
    }

    throw new Error();
  } catch (error) {
    if (!chapter.images) return [];

    return chapter.images.map((img) => {
      const { pathname, search } = new URL(img);
      return `${pathname}${search}`;
    });
  }
}
