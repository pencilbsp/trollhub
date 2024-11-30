import { ContentType } from '@prisma/client';
import { generateSitemap } from '@/lib/utils';

const limit = 5000;
const type = ContentType.movie;

export async function generateSitemaps() {
    // Fetch the total number of products and calculate the number of sitemaps needed
    return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap({ id }: { id: number }) {
    return generateSitemap({ id, take: limit, type });
}
