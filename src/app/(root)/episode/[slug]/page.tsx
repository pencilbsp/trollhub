import slug from 'slug';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_URL } from '@/config';
import numeral from '@/lib/format-number';
import { PageParams } from '@/types/page';
import updateView from '@/lib/update-view';
import { getEpisode } from '@/actions/guest/episode-actions';
import { avatarNameFallback, formatDate, getSlugId } from '@/lib/utils';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VideoView from '@/components/video-view';
import CommentList from '@/components/comment-list';
import { PlayerLoading } from '@/components/video-player';
import ChapterTable from '@/components/sections/guest/chapter-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const episodeId = getSlugId(params.slug);
    const episode = await getEpisode(episodeId);
    if (!episode) return notFound();

    const title = `${episode.content.title} ${episode.title}`;
    const description = episode.content.description?.slice(0, 255);

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            locale: 'vi_VN',
            type: 'video.movie',
            description: description,
            siteName: SITE_URL.origin,
            images: { url: episode.content.thumbUrl! },
        },
    };
}

export default async function EpisodePage({ params }: PageParams) {
    const episodeId = getSlugId(params.slug);
    const episode = await getEpisode(episodeId);

    if (!episode) return notFound();

    updateView(episode.id, 'chapter');

    return (
        <div className="container p-2 sm:px-8 xl:max-w-7xl">
            <div className="grid w-full grid-cols-3 gap-6 p-2">
                <div className="col-span-3 flex flex-col gap-6 lg:col-span-2">
                    <Card className="flex w-full items-center p-4">
                        <Avatar className="mr-1 h-14 w-14 border">
                            {episode.creator.avatar && <AvatarImage src={episode.creator.avatar} />}
                            <AvatarFallback>{avatarNameFallback(episode.creator.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2 flex flex-col">
                            <Link href={`/channel/${episode.creator.userName.slice(1)}`}>
                                <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{episode.creator.name}</h4>
                            </Link>
                            <div className="text-sm font-light text-gray-500">
                                <time className="font-light">{formatDate(episode.updatedAt)}</time>
                                <span className="px-1">&#8226;</span>
                                <span className="font-light text-gray-500">{numeral(episode.view || 0).format('0.0a')} lượt xem</span>
                            </div>
                        </div>
                    </Card>

                    <h1 className="flex flex-col items-center text-center text-2xl font-semibold text-blue-500 md:items-start md:text-start">
                        <Link href={`/movie/${slug(episode.content.title)}-${episode.content.id}`}>{episode.content.title}</Link>
                        <Badge variant="destructive" className="mt-2 md:px-3 md:py-1.5 md:text-base">
                            {episode.title}
                        </Badge>
                    </h1>

                    <Suspense fallback={<PlayerLoading />}>
                        <VideoView vid={episode.id} fid={episode.fid} contentId={episode.content.id} />
                    </Suspense>

                    <ChapterTable currentId={episode.id} contentId={episode.content.id} contentType={episode.content.type} contentTitle={episode.content.title} />

                    {episode.content.description && (
                        <div className="">
                            <h3 className="text-xl font-bold uppercase">Tóm tắt</h3>
                            <Card className="mt-4 p-4">{episode.content.description}</Card>
                        </div>
                    )}

                    <CommentList contentId={episode.content.id} />
                </div>
            </div>
        </div>
    );
}
