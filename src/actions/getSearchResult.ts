"use server";

import prisma from "@/lib/prisma";
import { ContentStatus, ContentType } from "@prisma/client";

interface SearchProps {
  take?: number;
  skip?: number;
}

type SearchCreator = {
  id: string;
  name: string;
  cover: string;
  avatar: string;
  userName: string;
};

type SearchContent = {
  id: string;
  view: number;
  title: string;
  author: string;
  updatedAt: string;
  keywords: string;
  thumbUrl: string;
  akaTitle?: string;
  type: ContentType;
  totalChap?: number;
  description?: string;
  status: ContentStatus;
  creator: SearchCreator;
};

export type SearchResult = {
  contents: SearchContent[];
  creators: SearchCreator[];
};

export default async function getSearchResult(
  keyword: string,
  searchProps?: SearchProps
): Promise<SearchResult> {
  const { take, skip } = searchProps || {};
  const contentPipeline: any = [
    {
      $match: {
        $text: { $search: `\"${keyword}\"`, $diacriticSensitive: true },
      },
    },
    { $unset: ["categoryIds", "fid", "createdAt"] },
    {
      $lookup: {
        from: "Creator",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: "$creator" },
    {
      $addFields: {
        id: { $toString: "$_id" },
        "creator.id": { $toString: "$creator._id" },
        updatedAt: {
          $dateToString: {
            format: "%Y-%m-%dT%H:%M:%S.%LZ",
            date: "$updatedAt",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        creatorId: 0,
        "creator.bio": 0,
        "creator.email": 0,
        "creator.updatedAt": 0,
        "creator.createdAt": 0,
        "creator.fid": 0,
        "creator._id": 0,
      },
    },
    { $sort: { updatedAt: -1 } },
  ];

  if (skip) contentPipeline.push({ $skip: skip });
  if (take) contentPipeline.push({ $limit: take });

  const creatorPipeline = [...contentPipeline];
  creatorPipeline[1] = {
    $unset: ["bio", "email", "updatedAt", "createdAt", "fid"],
  };

  const [contents, creators] = await Promise.all([
    prisma.content.aggregateRaw<any>({ pipeline: contentPipeline }),
    prisma.creator.aggregateRaw<any>({ pipeline: creatorPipeline }),
  ]);

  return { contents, creators } as any;
}
