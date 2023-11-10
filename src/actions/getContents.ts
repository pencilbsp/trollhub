"use server";

import prisma from "@/lib/prisma";
import { INIT_CREATER_CONTENT } from "@/config";

export const contentQuery = (options: any): any => ({
  select: {
    id: true,
    title: true,
    contents: {
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
      orderBy: {
        updatedAt: "desc",
      },
      ...options,
    },
  },
});

export async function getContentsByCategoryId(id: string, options = { take: INIT_CREATER_CONTENT, skip: 0 }) {
  const contents = await prisma.category.findUnique({
    where: { id },
    ...contentQuery(options),
  });

  return contents;
}
