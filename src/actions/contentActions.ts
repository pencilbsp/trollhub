'use server';

import prisma from '@/lib/prisma';
import getRedisClient, { getKeyWithNamespace } from '@/lib/redis';
import { ADULT_CATEGORY_ID, INIT_CHAPTER, INIT_TAKE_CONTENT, METADATA_EX_TIME } from '@/config';

type Options = {
    skip?: number;
    take?: number;
    select?: { [key: string]: boolean };
};

export type Content = NonNullable<Awaited<ReturnType<typeof get>>>;
export type ChapterList = Content['chapter'];
export type CategoryContent = NonNullable<Awaited<ReturnType<typeof getContentsByCategoryId>>>['contents'][number];

const EX = Math.floor(METADATA_EX_TIME / 8);

const get = (where: any, contentWhere: any) => {
    return prisma.content.findFirst({
        where,
        select: {
            id: true,
            view: true,
            title: true,
            hidden: true,
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
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    view: true,
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
                        where: contentWhere,
                        select: {
                            id: true,
                            title: true,
                            thumbUrl: true,
                            description: true,
                            type: true,
                            status: true,
                            updatedAt: true,
                            creator: {
                                select: {
                                    name: true,
                                    avatar: true,
                                    userName: true,
                                },
                            },
                        },
                        take: INIT_TAKE_CONTENT,
                        orderBy: {
                            updatedAt: 'desc',
                        },
                    },
                },
            },
            categories: {
                select: {
                    category: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            },
        },
    });
};

async function getContent(id: string): Promise<Content | null> {
    try {
        const redisClient = await getRedisClient();
        const key = getKeyWithNamespace(id);
        let cachedContent: any = await redisClient.get(key);

        if (!cachedContent) {
            const where = id.length !== 24 ? { fid: id } : { id };
            const contentWhere = { [id.length !== 24 ? 'fid' : 'id']: { notIn: [id] } };

            cachedContent = await get(where, contentWhere);
            if (!cachedContent) return null;

            await redisClient.set(key, JSON.stringify(cachedContent), { EX });
        } else {
            cachedContent = JSON.parse(cachedContent);
        }

        if (cachedContent.hidden) throw new Error('Hidden content.');

        return cachedContent;
    } catch (error) {
        return null;
    }
}

async function getContentsByCategoryId(id: string, options = { take: INIT_TAKE_CONTENT, skip: 0 }) {
    const data = await prisma.category.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            contents: {
                take: options.take,
                skip: options.skip,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    contentId: true,
                    content: {
                        select: {
                            id: true,
                            type: true,
                            view: true,
                            title: true,
                            status: true,
                            thumbUrl: true,
                            updatedAt: true,
                            description: true,
                            categoryIds: true,
                            creator: {
                                select: {
                                    name: true,
                                    avatar: true,
                                    userName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!data) return null;

    return {
        ...data,
        contents: data.contents.map(({ content }) => {
            const adultContent = content.categoryIds.includes(ADULT_CATEGORY_ID);
            return { ...content, adultContent };
        }),
    };
}

async function getContents(where: any, options: Options) {
    const total = await prisma.content.count({ where });
    const contents = await prisma.content.findMany({
        where,
        select: options.select ?? {
            id: true,
            type: true,
            title: true,
            thumbUrl: true,
            updatedAt: true,
            categoryIds: true,
            creator: {
                select: {
                    name: true,
                    avatar: true,
                    userName: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
        skip: options.skip ?? 0,
        take: options.take ?? INIT_TAKE_CONTENT,
    });

    return {
        contents: contents.map((content) => {
            const adultContent = content.categoryIds.includes(ADULT_CATEGORY_ID);
            return { ...content, adultContent, categoryIds: undefined };
        }),
        total,
    };
}

export { getContents, getContentsByCategoryId, getContent };
