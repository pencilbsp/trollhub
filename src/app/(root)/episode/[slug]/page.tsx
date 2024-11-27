import slug from "slug";
import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_URL } from "@/config";
import numeral from "@/lib/format-number";
import { PageParams } from "@/types/page";
import updateView from "@/lib/update-view";
import { getEpisode } from "@/actions/episodeActions";
import { avatarNameFallback, formatDate, getSlugId } from "@/lib/utils";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import VideoView from "@/components/VideoView";
import CommentList from "@/components/CommentList";
import { PlayerLoading } from "@/components/VideoPlayer";
import ChapterTable from "@/components/sections/ChapterTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
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
      locale: "vi_VN",
      type: "video.movie",
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

  updateView(episode.id, "chapter");

  return (
    <div className="container p-2 sm:px-8 xl:max-w-7xl">
      <div className="grid grid-cols-3 gap-6 w-full p-2">
        <div className="flex flex-col gap-6 col-span-3 lg:col-span-2">
          <Card className="w-full flex items-center p-4">
            <Avatar className="w-14 h-14 border mr-1">
              {episode.creator.avatar && (
                <AvatarImage src={episode.creator.avatar} />
              )}
              <AvatarFallback>
                {avatarNameFallback(episode.creator.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ml-2">
              <Link href={`/channel/${episode.creator.userName.slice(1)}`}>
                <h4 className="font-semibold text-xl text-gray-700 dark:text-gray-300">
                  {episode.creator.name}
                </h4>
              </Link>
              <div className="text-gray-500 font-light text-sm">
                <time className="font-light">
                  {formatDate(episode.updatedAt)}
                </time>
                <span className="px-1">&#8226;</span>
                <span className="text-gray-500 font-light">
                  {numeral(episode.view || 0).format("0.0a")} lượt xem
                </span>
              </div>
            </div>
          </Card>

          <h1 className="flex flex-col items-center md:items-start font-semibold text-2xl text-blue-500 text-center md:text-start">
            <Link
              href={`/movie/${slug(episode.content.title)}-${
                episode.content.id
              }`}
            >
              {episode.content.title}
            </Link>
            <Badge
              variant="destructive"
              className="mt-2 md:px-3 md:py-1.5 md:text-base"
            >
              {episode.title}
            </Badge>
          </h1>

          <Suspense fallback={<PlayerLoading />}>
            <VideoView
              vid={episode.id}
              fid={episode.fid}
              contentId={episode.content.id}
            />
          </Suspense>

          <ChapterTable
            currentId={episode.id}
            contentId={episode.content.id}
            contentType={episode.content.type}
            contentTitle={episode.content.title}
          />

          {episode.content.description && (
            <div className="">
              <h3 className="font-bold text-xl uppercase">Tóm tắt</h3>
              <Card className="p-4 mt-4">{episode.content.description}</Card>
            </div>
          )}

          <CommentList contentId={episode.content.id} />
        </div>
      </div>
    </div>
  );
}
