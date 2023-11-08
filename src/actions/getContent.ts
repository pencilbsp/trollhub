import prisma from "@/lib/prisma";
import { INIT_CHAPTER, INIT_CREATER_CONTENT } from "@/config";

export default function getContent(id: string) {
  return prisma.content.findUnique({
    where: {
      id,
    },
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
            where: {
              id: {
                notIn: [id],
              },
            },
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
            take: INIT_CREATER_CONTENT,
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
  });
}
