"use server";

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

async function cloneImages(chapterId: string, fid: string) {
  const images = await comicParser(createEmbedUrl(fid, COMIC_VERSION));
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
}

export async function getImages(
  chapter: NonNullable<Awaited<ReturnType<typeof getChapter>>>
): Promise<string[]> {
  try {
    if (chapter.type === "comic" && chapter.status === "pending") {
      chapter.images = await cloneImages(chapter.id, chapter.fid!);
      chapter.status = "ready";
    }

    if (chapter.type === "novel" && chapter.status === "pending") {
      chapter.text = await cloneText(chapter.id, chapter.fid!);
      chapter.status = "ready";

      return chapter.text ? [chapter.text] : [];
    }

    const url = `${USER_CONTENTS_HOST}/api/fttps:webp/${chapter.fid}`;
    const response = await fetch(url, { cache: "no-cache" });
    const data = await response.json();

    if (!data.images || data.images.length === 0) throw new Error();
    return data.images.map(
      (i: string) => `${USER_CONTENTS_HOST}/images/${chapter.fid}/${i}`
    );
  } catch (error) {
    if (!chapter.images) return [];

    return chapter.images.map((img) => {
      const { pathname, search } = new URL(img);
      return `${pathname}${search}`;
    });
  }
}
