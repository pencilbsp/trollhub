'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Content as IContent, Creator, ContentStatus, ContentType } from '@prisma/client';
import { FilmIcon, ShareIcon, ImageIcon, EyeOffIcon, ThumbsUpIcon, BookOpenTextIcon, MessageCircleIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import Thumbnail from '@/components/thumbnail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import { formatToNow } from '@/lib/date';
import numeral from '@/lib/format-number';
import useSettings from '@/hooks/use-settings';
import { HighlightContent } from '@/actions/guest/home-actions';
import { CategoryContent } from '@/actions/guest/content-actions';
import { avatarNameFallback, cn, generateHref } from '@/lib/utils';

function getContentIcon(type: ContentType) {
    if (type === ContentType.movie) return FilmIcon;
    if (type === ContentType.comic) return ImageIcon;
    return BookOpenTextIcon;
}

export interface Content extends IContent {
    adultContent: boolean;
    creator: Pick<Creator, 'name' | 'avatar' | 'userName'>;
}

type ContentHorizontalProps = { data: Content | CategoryContent };

function ContentHorizontal({ data }: ContentHorizontalProps) {
    const descriptionRef = useRef<HTMLDivElement>(null);
    const { id, type, creator, thumbUrl, title, updatedAt, description, status, adultContent, view } = data;

    const ContentIcon = getContentIcon(type);
    const href = generateHref({ type, title, id });

    useEffect(() => {
        if (descriptionRef.current) {
            const elm = descriptionRef.current;
            if (elm.scrollHeight > elm.offsetHeight) {
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [descriptionRef.current]);

    return (
        <Card className="w-full">
            <CardHeader className="p3 sm:p-6">
                <Avatar className="mr-2 h-10 w-10 border">
                    {creator.avatar && <AvatarImage src={creator.avatar} />}
                    <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                    <Link href={`/channel/${creator.userName.slice(1)}`} className="truncate text-gray-700 dark:text-gray-400">
                        {creator.name}
                    </Link>
                    <time className="text-xs text-gray-700">{formatToNow(updatedAt)}</time>
                </div>
            </CardHeader>
            <CardContent>
                <div className="px-3 sm:px-6">
                    <Link href={href}>
                        <h3 className="text-xl font-semibold">{title}</h3>
                    </Link>
                    {description && (
                        <div className="relative flex flex-col">
                            <div ref={descriptionRef} className="mt-2 line-clamp-3 text-gray-700 dark:text-gray-400">
                                {description}
                            </div>
                        </div>
                    )}
                </div>
                <Link href={href}>
                    <Thumbnail thumbUrl={thumbUrl!} alt={title} ratio="16/9" adultContent={adultContent}>
                        <Badge className="mb-3 border-none bg-stone-950/30 text-white backdrop-blur">
                            <ContentIcon size={28} />
                        </Badge>
                        <Badge variant="destructive">{status === ContentStatus.complete ? 'Đã hoàn thành' : 'Đang xuất bản'}</Badge>
                    </Thumbnail>
                </Link>
            </CardContent>
            <CardFooter className="px3 mt-2 grid grid-cols-1 divide-y pb-3 text-gray-700 dark:text-gray-400 sm:px-6 sm:pb-6">
                <div className="flex justify-between pb-2 text-sm">
                    <div className="flex gap-3">
                        <span>0 lượt thích</span>
                        <span>10 bình luận</span>
                    </div>
                    <span>{numeral(view || 0).format('0.0a')} lượt xem</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                    <button className="flex items-center justify-center rounded-md py-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-900">
                        <ThumbsUpIcon size={20} className="stroke-current" />
                        <span className="ml-2">Thích</span>
                    </button>
                    <button className="flex items-center justify-center rounded-md py-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-900">
                        <MessageCircleIcon size={20} className="stroke-current" />
                        <span className="ml-2">Bình luận</span>
                    </button>
                    <button className="flex items-center justify-center rounded-md py-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-900">
                        <ShareIcon size={20} className="stroke-current" />
                        <span className="ml-2">Chia sẻ</span>
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
}

type ContentVerticalProps = { data: Content | CategoryContent | HighlightContent };

function ContentVertical({ data }: ContentVerticalProps) {
    const { showAdultContent } = useSettings();
    const { id, creator, thumbUrl, title, status, type, adultContent, updatedAt } = data;
    const isShow = adultContent && !showAdultContent;
    const ContentIcon = getContentIcon(type);
    const href = generateHref({ type, title, id });

    return (
        <Link href={href} className="group flex">
            <Card className="w-full">
                <CardHeader>
                    <Avatar className="mr-1 h-8 w-8 border">
                        {creator.avatar && <AvatarImage src={creator.avatar} />}
                        <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{creator.name}</span>
                        <time className="truncate text-xs font-light text-primary/75">{formatToNow(updatedAt)}</time>
                    </div>
                </CardHeader>

                <CardContent className="relative aspect-[3/4] overflow-hidden rounded-lg p-0">
                    <Image unoptimized width={0} height={0} alt={title} sizes="100vw" src={thumbUrl!} className={cn('h-full w-full object-cover', isShow && 'blur-md')} />
                    {isShow && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 font-light text-muted">
                            <EyeOffIcon className="h-4 w-4 cursor-pointer" />
                            <span className="mt-2 text-center text-xs">
                                Hình ảnh chứa
                                <br />
                                nội dung nhạy cảm
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-2">
                        <Badge className="border-none bg-stone-950/30 text-white backdrop-blur">
                            <ContentIcon className="h-5 w-5" />
                        </Badge>
                        <Badge variant="destructive">{status === ContentStatus.complete ? 'Đã hoàn thành' : 'Đang xuất bản'}</Badge>
                    </div>
                </CardContent>
                <CardFooter>
                    <h3 className="line-clamp-2 min-h-[2lh] font-bold transition-colors group-hover:text-blue-500">{title}</h3>
                </CardFooter>
            </Card>
        </Link>
    );
}

// interface Props {
//     direction: 'horizontal' | 'vertical';
//     data: Content | CategoryContent | HighlightContent;
// }

export { ContentHorizontal, ContentVertical };

// export default function ContentCard({ data, direction }: Props) {
//     return <Fragment>{direction === 'horizontal' ? <ContentHorizontal data={data} /> : <ContentVertical data={data} />}</Fragment>;
// }
