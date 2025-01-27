import { Prisma } from '@prisma/client';

export const getContentArgs = {
    where: { id: '' },
    select: {
        id: true,
        type: true,
        title: true,
        hidden: true,
        status: true,
        akaTitle: true,
        thumbUrl: true,
        description: true,
        categories: { select: { category: { select: { id: true, title: true } } } },
    },
} as const satisfies Prisma.ContentFindUniqueArgs;
