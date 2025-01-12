import prisma from '@/lib/prisma';
import { ADULT_CATEGORY_ID } from '@/config';

const TAKE = 12;

async function getCreatorWithContent(userName: string) {
    const creator = await prisma.creator.findUnique({
        where: {
            userName: '@' + userName,
        },
        include: {
            contents: {
                take: TAKE,
                orderBy: {
                    updatedAt: 'desc',
                },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    status: true,
                    thumbUrl: true,
                    updatedAt: true,
                    categoryIds: true,
                },
            },
        },
    });

    if (!creator) return null;

    return {
        ...creator,
        contents: creator.contents.map((content) => {
            const adultContent = content.categoryIds.includes(ADULT_CATEGORY_ID);
            return { ...content, adultContent };
        }),
    };
}

async function getCreator(userName: string) {
    userName = '@' + userName;
    const result = await prisma.creator.findUnique({ where: { userName } });
    return result;
}

async function getCreatorByIds(ids: string[]) {
    const result = await prisma.creator.findMany({ where: { id: { in: ids } } });
    return result;
}

export type CreatorContent = NonNullable<Awaited<ReturnType<typeof getCreatorWithContent>>>['contents'][number];

export { getCreator, getCreatorByIds, getCreatorWithContent };
