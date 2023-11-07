"use server";

import prisma from "@/lib/prisma";

interface Options {
  take?: number;
  skip?: number;
  sort?: "desc" | "asc";
}

const defaultOptions = {
  take: 6,
  skip: 0,
  sort: "desc",
};

export default async function getComments(contentId: string, options?: Options) {
  let { take, sort, skip } = options || defaultOptions;
  if (!take || take < 1) take = defaultOptions.take;
  if (!skip || skip < 0) skip = defaultOptions.skip;

  const total = await prisma.comment.count({ where: { contentId } });

  const comments = await prisma.comment.findMany({
    where: {
      contentId,
    },
    take,
    skip,
    orderBy: {
      createdAt: sort as any,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  const isMore = total > comments.length + skip;

  return { list: comments, isMore, options };
}
