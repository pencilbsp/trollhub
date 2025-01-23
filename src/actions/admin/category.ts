'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const getCategories = async <T extends Prisma.CategoryFindManyArgs>(args: Prisma.Exact<T, Prisma.CategoryFindManyArgs>) => {
    try {
        const result = await prisma.category.findMany(args);
        return { data: result, total: result.length };
    } catch (error: any) {
        return { error: { message: error.message as string } };
    }
};

export { getCategories };
