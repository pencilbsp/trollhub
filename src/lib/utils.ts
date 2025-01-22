import slug from 'slug';
import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { Metadata, MetadataRoute } from 'next';

import prisma from './prisma';
import { SITE_URL } from '@/config';
import { ContentType } from '@prisma/client';
import { type Content } from '@/actions/guest/content-actions';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function avatarNameFallback(name?: string | null) {
    if (!name) return 'NA';

    const words = name.split(' ');
    let nameFallback = words[0][0].toLocaleUpperCase();
    if (words.length > 1) nameFallback += words[1][0]?.toLocaleUpperCase();

    return nameFallback;
}

export function generateKeywords(title: string, data: string[], userName: string, type: ContentType) {
    const titleEng = slug(title, { replacement: ' ' });
    const prefixVie = type === 'movie' ? 'phim ' : 'truyện ';
    const prefixEng = type === 'movie' ? 'phim ' : 'truyen ';

    const keywords = [];
    keywords.push(title);
    type === 'movie' && keywords.push(title + ' vietsub');
    keywords.push(title + ' fuhu');
    keywords.push(title + ' fuhuzz');
    keywords.push(titleEng);
    keywords.push(titleEng + ' fuhu');
    keywords.push(titleEng + ' fuhuzz');
    keywords.push(prefixVie + title);
    keywords.push(prefixEng + titleEng);
    keywords.push(title + ' ' + userName);
    keywords.push(userName);
    keywords.push(...data);
    keywords.push(
        ...(type === 'movie'
            ? ['xem phim', 'xem phim online', 'phim vietsub']
            : ['đọc truyện', 'truyện hay', 'đọc truyện online', 'đọc truyenfull', 'truyện tranh', 'truyện ngôn tình']),
    );

    return keywords;
}

export function getSlugId(slug: string) {
    if (slug.endsWith('.html')) {
        return slug.replace('.html', '').split('_')?.[1];
    } else {
        return slug.slice(-24);
    }
}

export const getPrefix = (type: ContentType) => {
    switch (type) {
        case 'comic':
            return 'Truyện tranh';
        case 'novel':
            return 'Truyện chữ';
        case 'video':
            return 'Video';
        default:
            return 'Phim';
    }
};

export function generateContentMetadata(data: Content): Metadata {
    return {
        title: `[${getPrefix(data.type)}] ${data.title + ' - ' + data.creator.name}`,
        description: `${['comic', 'novel'].includes(data.type) ? 'Đọc truyện' : 'Xem phim'} ${data.description?.slice(0, 245)}`,
        keywords: generateKeywords(data.title, data.akaTitle, data.creator.name, data.type),
        openGraph: {
            locale: 'vi_VN',
            title: data.title,
            siteName: SITE_URL.origin,
            images: { url: data.thumbUrl! },
            description: data.description?.slice(0, 255),
            type: data.type === 'movie' ? 'video.movie' : 'website',
        },
    };
}

export async function generateSitemap({ id, type, take }: { id: number; take: number; type: ContentType }): Promise<MetadataRoute.Sitemap> {
    const skip = id * take;

    const contents = await prisma.content.findMany({
        where: {
            type,
        },
        skip: skip,
        take: take,
        orderBy: {
            id: 'desc',
        },
        select: {
            id: true,
            type: true,
            title: true,
            updatedAt: true,
        },
    });

    return contents.map((content) => ({
        lastModified: content.updatedAt,
        url: SITE_URL.origin + generateHref({ type: content.type, id: content.id, title: content.title }),
    }));
}

export function chaptersMapTable(data: any) {
    return data.map((chapter: any) => {
        const { content, title, id, type, createdAt, status, mobileOnly, fid } = chapter;
        const contentSlug = slug(content.title);

        return {
            id,
            title,
            createdAt: createdAt,
            contentId: content.id,
            status: status.toString(),
            contentTitle: content.title,
            mobileOnly: mobileOnly.toString(),
            url: generateHref({ type, id, title, contentTitle: content.title }),
            contentUrl: generateHref({ type: content.type, id: content.id, title: content.title }),
            app: `https://fuhu.page.link/?link=https://fuhux.com/${
                type === 'movie' ? 'movie-eps' : type === 'comic' ? 'comic-chapter' : 'novel-chapter'
            }/${contentSlug}_${fid}.html&apn=net.zfunhub&ibi=net.mbf.FunHub&isi=1572604579`,
        };
    });
}

export function generateHref({ type, id, title, contentTitle }: any) {
    const titleSlug = slug(title?.trim() || '');

    if (!contentTitle) {
        if (!type.endsWith('/')) type = type + '/';
        if (!type.startsWith('/')) type = '/' + type;

        const paths: string[] = [];
        if (titleSlug) paths.push(titleSlug);
        paths.push(id);

        return type + paths.join('-');
    }

    const contentSlug = slug(contentTitle.trim());
    const path = type ? (type === ContentType.movie ? '/episode/' : '/chapter/') : '';
    return path + [contentSlug, titleSlug, id].join('-');
}
