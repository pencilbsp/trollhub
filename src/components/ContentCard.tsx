"use client"

import slug from "slug"
import Link from "next/link"
import numeral from "numeral"
import Image from "next/image"
import { useEffect, useRef } from "react"
import {
  FilmIcon,
  ShareIcon,
  ImageIcon,
  EyeOffIcon,
  ThumbsUpIcon,
  BookOpenTextIcon,
  MessageCircleIcon,
} from "lucide-react"

import Thumbnail from "./Thumbnail"
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"

import useSettings from "@/hooks/useSettings"
import { avatarNameFallback, cn, formatToNow } from "@/lib/utils"
import { Content, Creator, ContentStatus, ContentType } from "@prisma/client"

function getContentIcon(type: ContentType) {
  if (type === ContentType.movie) return FilmIcon
  if (type === ContentType.comic) return ImageIcon
  return BookOpenTextIcon
}

export interface ContentWithCreator extends Content {
  creator: Creator
  adultContent: boolean
}

interface Props {
  data: ContentWithCreator
  direction: "horizontal" | "vertical"
}

function ContentHorizontal({ data }: { data: ContentWithCreator }) {
  const descriptionRef = useRef<HTMLDivElement>(null)
  const { id, type, creator, thumbUrl, title, updatedAt, description, status, adultContent, view } = data

  const ContentIcon = getContentIcon(type)
  const href = `/${type}/${slug(title)}-${id}`

  useEffect(() => {
    if (descriptionRef.current) {
      const elm = descriptionRef.current
      if (elm.scrollHeight > elm.offsetHeight) {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionRef.current])

  return (
    <Card className="w-full">
      <CardHeader className="p3 sm:p-6">
        <Avatar className="w-10 h-10 border mr-2">
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
            <h3 className="font-semibold text-xl">{title}</h3>
          </Link>
          {description && (
            <div className="flex flex-col relative">
              <div ref={descriptionRef} className="text-gray-700 dark:text-gray-400 mt-2 line-clamp-3">
                {description}
              </div>
            </div>
          )}
        </div>
        <Link href={href}>
          <Thumbnail thumbUrl={thumbUrl!} alt={title} ratio="16/9" adultContent={adultContent}>
            <Badge className="bg-stone-950/30 backdrop-blur text-white border-none mb-3">
              <ContentIcon size={28} />
            </Badge>
            <Badge variant="destructive">{status === ContentStatus.complete ? "Đã hoàn thành" : "Đang xuất bản"}</Badge>
          </Thumbnail>
        </Link>
      </CardContent>
      <CardFooter className="px3 sm:px-6 pb-3 sm:pb-6 mt-2 grid grid-cols-1 divide-y text-gray-700 dark:text-gray-400">
        <div className="flex justify-between text-sm pb-2">
          <div className="flex gap-3">
            <span>0 lượt thích</span>
            <span>10 bình luận</span>
          </div>
          <span>{numeral(view || 0).format("0a")} lượt xem</span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          <button className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors rounded-md py-1.5">
            <ThumbsUpIcon size={20} className="stroke-current" />
            <span className="ml-2">Thích</span>
          </button>
          <button className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors rounded-md py-1.5">
            <MessageCircleIcon size={20} className="stroke-current" />
            <span className="ml-2">Bình luận</span>
          </button>
          <button className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors rounded-md py-1.5">
            <ShareIcon size={20} className="stroke-current" />
            <span className="ml-2">Chia sẻ</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}

function ContentVertical({ data }: { data: ContentWithCreator }) {
  const { showAdultContent } = useSettings()
  const { id, creator, thumbUrl, title, status, type, adultContent, updatedAt } = data
  const isShow = adultContent && !showAdultContent
  const ContentIcon = getContentIcon(type)
  const href = `/${type}/${slug(title)}-${id}`

  return (
    <Link href={href} className="group flex">
      <Card className="w-full">
        <CardHeader>
          <Avatar className="w-8 h-8 border mr-1">
            {creator.avatar && <AvatarImage src={creator.avatar} />}
            <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="truncate text-sm text-gray-700">{creator.name}</span>
            <time className="truncate text-xs text-gray-600/80">{formatToNow(updatedAt)}</time>
          </div>
        </CardHeader>

        <CardContent className="aspect-[3/4] relative rounded-lg overflow-hidden p-0">
          <Image
            width={0}
            height={0}
            alt={title}
            sizes="100vw"
            src={thumbUrl!}
            className={cn("w-full h-full object-cover", isShow && "blur-md")}
          />
          {isShow && (
            <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-muted font-light">
              <EyeOffIcon className="cursor-pointer w-4 h-4" />
              <span className="text-xs text-center mt-2">
                Hình ảnh chứa
                <br />
                nội dung nhạy cảm
              </span>
            </div>
          )}
          <div className="absolute inset-0 p-2 flex flex-col items-start justify-end gap-2">
            <Badge className="bg-stone-950/30 backdrop-blur text-white border-none">
              <ContentIcon className="w-5 h-5" />
            </Badge>
            <Badge variant="destructive">{status === ContentStatus.complete ? "Đã hoàn thành" : "Đang xuất bản"}</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <h3 className="line-clamp-2 font-bold group-hover:text-blue-500 transition-colors min-h-[2lh]">{title}</h3>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default function ContentCard({ data, direction }: Props) {
  return <>{direction === "horizontal" ? <ContentHorizontal data={data} /> : <ContentVertical data={data} />}</>
}
