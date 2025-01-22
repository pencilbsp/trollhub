import slug from 'slug';

import { vi } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { Metadata, MetadataRoute } from 'next';
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';

import prisma from './prisma';
import { SITE_URL } from '@/config';
import { ContentType } from '@prisma/client';
import { type DateRange } from 'react-day-picker';
import { Content } from '@/actions/guest/content-actions';

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

export const formatToNow = (date: string | number | Date) => {
    const now = new Date();
    const daysDifference = differenceInDays(now, new Date(date));

    if (daysDifference < 7) {
        return formatDistanceToNow(new Date(date), {
            locale: vi,
            includeSeconds: true,
            addSuffix: true,
        });
    } else {
        return formatDate(date, 'HH:mm dd/MM/yyyy');
    }
};

const isDateRange = (date: any): date is DateRange => {
    return typeof date === 'object' && 'from' in date && 'to' in date;
};

export const formatDate = (date: string | number | Date | DateRange, fstring: string = 'HH:mm dd/MM/yyyy'): string => {
    if (isDateRange(date)) {
        return `${format(date.from || new Date(), fstring, { locale: vi })} - ${format(date.to || new Date(), fstring, { locale: vi })}`;
    }

    return format(new Date(date), fstring, { locale: vi });
};

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
        const path = type ? '/' + type + '/' : '';
        return path + [titleSlug, id].join('-');
    }

    const contentSlug = slug(contentTitle.trim());
    const path = type ? (type === ContentType.movie ? '/episode/' : '/chapter/') : '';
    return path + [contentSlug, titleSlug, id].join('-');
}
