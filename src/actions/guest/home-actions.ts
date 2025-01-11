// utils
import prisma from '@/lib/prisma';
import { ADULT_CATEGORY_ID } from '@/config';

const get = async (slug: string) => {
    const data = await prisma.category.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            contents: {
                take: 8,
                select: {
                    content: {
                        select: {
                            id: true,
                            type: true,
                            title: true,
                            status: true,
                            thumbUrl: true,
                            updatedAt: true,
                            creator: {
                                select: {
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    content: {
                        updatedAt: 'desc',
                    },
                },
            },
        },
    });

    if (!data) throw new Error();

    return {
        ...data,
        contents: data.contents.map((item) => {
            const content = item.content;
            const adultContent = data.id === ADULT_CATEGORY_ID;
            return { ...content, adultContent };
        }),
    };
};

async function getHomeData() {
    const highlights = await Promise.all(
        ['fh-sentimental', 'fh-tieu-thuyet', 'fh-tv-show', 'fh-boys-love', 'fh-girls-love', 'fh-truyen-nam', 'fh-modern', 'fh-historical-drama', 'fh-romance'].map(get),
    );

    const categories = await prisma.category.findMany({
        where: {},
        select: {
            id: true,
            slug: true,
            title: true,
        },
    });

    const contents = await prisma.content.findMany({
        where: {},
        orderBy: {
            updatedAt: 'desc',
        },
        include: {
            categories: {
                include: {
                    category: true,
                },
            },
        },
        take: 6,
    });

    const slide = contents.map((content) => ({
        id: content.id,
        type: content.type,
        title: content.title,
        tagline: content.akaTitle[0] ?? '',
        image: content.thumbUrl?.replace('_256x', '_720x') || '',
        adultContent: content.categories.some((c) => c.category.id === ADULT_CATEGORY_ID),
    }));

    return { slide, highlights, categories };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
export type HighlightContent = HomeData['highlights'][number]['contents'][number];

export default getHomeData;
