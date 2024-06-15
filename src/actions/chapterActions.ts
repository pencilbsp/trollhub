"use server";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ChapterStatus } from "@prisma/client";

import prisma from "@/lib/prisma";
import authOptions from "@/lib/auth";
import { generateKeywords } from "@/lib/utils";
import { METADATA_EX_TIME, SITE_URL, filterable } from "@/config";
import getRedisClient, { getKeyWithNamespace } from "@/lib/redis";

export type Chapter = NonNullable<Awaited<ReturnType<typeof getChapter>>>;

export const chapterQuery = (options: any): any => ({
  select: {
    id: true,
    view: true,
    type: true,
    title: true,
    status: true,
    createdAt: true,
    mobileOnly: true,
  },
  ...options,
});

export async function getChapter(id: string) {
  try {
    // const redis = await getRedisClient();
    // const redisKey = getKeyWithNamespace(id);
    // const cached = await redis.json(redisKey);

    // if (cached) {
    //   return cached as any;
    // }

    const where = id.length !== 24 ? { fid: id } : { id };
    const data = await prisma.chapter.findUnique({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!data) throw Error("Nội dung không tồn tại");

    // await redis.set(redisKey, JSON.stringify(data), { EX: 1 * 60 * 60 });

    return data;
  } catch (error) {
    return null;
  }
}

export async function getChapters(where: any, options: any = { take: 12, skip: 0, orderBy: { createdAt: "desc" } }) {
  // console.log(options)
  const data = await prisma.chapter.findMany({
    where,
    ...chapterQuery(options),
  });

  const total = await prisma.chapter.count({ where });
  return { data, total };
}

export async function getChapterMetadata(id: string): Promise<Metadata | null> {
  try {
    const redis = await getRedisClient();
    const redisKey = getKeyWithNamespace(id, "metadata");
    const cached = await redis.json<Metadata>(redisKey);

    if (cached) {
      return cached;
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: {
        type: true,
        title: true,
        creator: {
          select: {
            name: true,
          },
        },
        content: {
          select: {
            title: true,
            thumbUrl: true,
            description: true,
          },
        },
      },
    });

    if (!chapter) return null;

    const title = `${chapter.content.title} ${chapter.title}`;
    let description = `Đọc truyện ${chapter?.content.title}`;

    if (chapter.content.description) {
      description += `: ${chapter.content.description.slice(0, 198)}`;
    }

    const metadata: Metadata = {
      title: title,
      description: description,
      keywords: generateKeywords(title, [], chapter.creator.name, chapter.type),
      openGraph: {
        title: title,
        locale: "vi_VN",
        description: description,
        siteName: SITE_URL.origin,
        images: { url: chapter.content.thumbUrl! },
        type: chapter.type === "movie" ? "video.movie" : "website",
      },
    };

    await redis.set(redisKey, JSON.stringify(metadata), {
      EX: METADATA_EX_TIME,
    });

    return metadata;
  } catch (error) {
    return null;
  }
}

export async function requestChapter(chapterId: string, message?: string) {
  try {
    if (message && message.length > 500) {
      throw new Error("Lời nhắn không được vượt quá 500 kí tự.");
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Vui lòng đăng nhập để gửi yêu cầu.");
    }

    let status = false;
    const request = await prisma.requestChapter.findUnique({
      where: {
        chapterId_userId: {
          chapterId,
          userId: session.user.id,
        },
      },
    });

    if (!request) {
      status = true;
      await prisma.requestChapter.create({
        data: {
          chapterId,
          userId: session.user.id,
          message: message?.trim(),
        },
      });
    }

    const totalRequest = await prisma.requestChapter.count({
      where: {
        chapterId,
      },
    });

    return {
      message: "Đã yêu cầu xử lý nội dung thành công.",
      status,
      totalRequest,
    };
  } catch (error: any) {
    return {
      error: {
        message: (error?.message || "Đã xảy ra lỗi, vui lòng thử lại sau.") as string,
      },
    };
  }
}

export async function getRequestedChapters(queryString: string) {
  try {
    const query = new URLSearchParams(queryString);
    let sort = query.get("sort");
    const type = query.get("type");
    let end = Number(query.get("end"));
    let start = Number(query.get("start"));

    if (start < 0) {
      start = 0;
    }

    if (end < 0 || end <= start) {
      end = start + 12;
    }

    if (!sort || !filterable.map(({ key }) => key).includes(sort)) {
      sort = "createdAt_desc";
    }

    const where: any = {};
    const orderBy = { [sort.split("_")[0]]: sort.split("_")[1] };

    if (orderBy.chapterId) {
      const [totalAggregated, group] = await Promise.all([
        prisma.requestChapter.aggregateRaw({
          pipeline: [
            {
              $group: {
                _id: "$chapterId",
              },
            },
            {
              $count: "count",
            },
          ],
        }),
        prisma.requestChapter.groupBy({
          by: ["chapterId", "status"],
          _count: {
            chapterId: true,
          },
          orderBy: {
            _count: orderBy,
          },
          skip: start,
          take: end - start,
        }),
      ]);

      const chapters = await prisma.chapter.findMany({
        where: {
          id: {
            in: group.map(({ chapterId }) => chapterId),
          },
        },
        select: {
          id: true,
          type: true,
          title: true,
          content: {
            select: {
              title: true,
              thumbUrl: true,
            },
          },
        },
      });

      const result = group.reduce((acc: any, item) => {
        const chapter = chapters.find(({ id }) => id === item.chapterId);
        acc.push({
          ...chapter,
          cid: item.chapterId,
          status: item.status,
          count: item._count.chapterId,
        });
        return acc;
      }, []);

      // @ts-ignore
      return { data: { total: totalAggregated[0].count, requests: result } };
    } else {
      if (type === "own") {
        const session = await getServerSession(authOptions);
        if (!session) {
          throw new Error("Vui lòng đăng nhập để thực hiện yêu cầu.");
        }

        where.userId = session.user.id;
      }

      const [total, requests] = await Promise.all([
        prisma.requestChapter.count({
          where,
        }),
        prisma.requestChapter.findMany({
          where,
          orderBy,
          select: {
            id: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            chapter: {
              select: {
                id: true,
                type: true,
                title: true,
                content: {
                  select: {
                    title: true,
                    thumbUrl: true,
                  },
                },
              },
            },
          },
          skip: start,
          take: end - start,
        }),
      ]);

      return {
        data: {
          total,
          requests: requests.map(({ id, status, chapter, createdAt, user }) => ({
            id,
            user,
            status,
            createdAt,
            cid: chapter.id,
            type: chapter.type,
            title: chapter.title,
            content: { title: chapter.content.title, thumbUrl: chapter.content.thumbUrl },
          })),
        },
      };
    }
  } catch (error: any) {
    return {
      data: {
        total: 0,
        requests: [],
      },
      error: {
        message: error.message,
      },
    };
  }
}

export async function resetChapterStatus(id: string, fid: string) {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) throw new Error("Nội dung này không tồn tại hoặc đã bị xoá");

    // const redis = await getRedisClient();
    // await redis.del(getKeyWithNamespace(id));
    // await redis.del(getKeyWithNamespace(fid));

    if (chapter.status === ChapterStatus.ready) {
      return {
        message: "Nội dung này đã sẵn sàng để xem",
      };
    }

    if (chapter.status === ChapterStatus.pending) {
      return {
        message: "Nội dung này sẽ sớm được xử lý",
      };
    }

    await prisma.chapter.update({
      where: {
        id,
      },
      data: {
        status: ChapterStatus.pending,
      },
    });

    return {
      message: "Yêu cầu thành công, xin hãy quay lại sau",
    };
  } catch (error: any) {
    return {
      error: {
        message: error.message,
      },
    };
  }
}

export async function checkRequestStatus(chapterId: string) {
  try {
    const totalRequest = await prisma.requestChapter.count({
      where: { chapterId },
    });

    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { requested: false, totalRequest };

    const requested = await prisma.requestChapter.findUnique({
      where: {
        chapterId_userId: {
          chapterId,
          userId: session.user.id,
        },
      },
    });

    return { requested: !!requested, totalRequest };
  } catch (error: any) {
    return {
      error: {
        message: (error?.message || "Đã xảy ra lỗi, vui lòng thử lại sau") as string,
      },
    };
  }
}
