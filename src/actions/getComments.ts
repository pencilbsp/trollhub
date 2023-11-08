"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Options {
  take?: number;
  skip?: number;
  sort?: Prisma.SortOrder;
}

const defaultOptions: Options = { take: 6, skip: 0, sort: "desc" };

export default async function getComments(contentId: string, options?: Options) {
  let { take, sort, skip } = options || defaultOptions;

  if (!sort) sort = "desc";
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
      createdAt: sort,
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

  const isMore = total > comments.length + skip!;

  return { list: comments, isMore, total, options: { take, skip, sort } };
}
