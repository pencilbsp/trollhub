"use server";

import prisma from "@/lib/prisma";

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

export default async function getChapters(
  contentId: string,
  options: any = { take: 12, skip: 0, orderBy: { createdAt: "desc" } }
) {
  return prisma.chapter.findMany({
    where: {
      contentId,
    },
    ...chapterQuery(options),
  });
}
