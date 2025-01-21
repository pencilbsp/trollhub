'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

import { type SearchArgs } from '@/lib/prisma';

async function getContents<T extends SearchArgs>(args?: Prisma.Exact<T, SearchArgs>) {
    try {
        const result = await prisma.content.search(args);
        return { data: result.data, total: result.total };
    } catch (error: any) {
        return { error: { message: error.message as string } };
    }
}

export { getContents };
