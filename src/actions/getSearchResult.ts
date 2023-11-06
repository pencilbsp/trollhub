"use server";

import prisma from "@/lib/prisma";

interface SearchProps {
  take?: number;
  skip?: number;
}

export default async function getSearchResult(keyword: string, searchProps?: SearchProps) {
  const { take, skip } = searchProps || {};
  const contentPipeline: any = [
    { $match: { $text: { $search: `\"${keyword}\"`, $diacriticSensitive: true } } },
    { $unset: ["categoryIds", "fid", "updatedAt", "createdAt", "creatorId"] },
    { $addFields: { id: { $toString: "$_id" } } },
    { $project: { _id: 0 } },
    { $sort: { updatedAt: 1 } },
  ];

  if (skip) contentPipeline.push({ $skip: skip });
  if (take) contentPipeline.push({ $limit: take });

  const creatorPipeline = [...contentPipeline];
  creatorPipeline[1] = { $unset: ["bio", "email", "updatedAt", "createdAt", "fid"] };

  const [contents, creators] = await Promise.all([
    prisma.content.aggregateRaw({ pipeline: contentPipeline }),
    prisma.creator.aggregateRaw({ pipeline: creatorPipeline }),
  ]);

  return { contents, creators };
}
