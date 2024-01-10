import slug from "slug"
import Image from "next/image"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import prisma from "@/lib/prisma"
import { ADULT_CATEGORY_ID, SITE_NAME, SITE_URL } from "@/config"
import { avatarNameFallback } from "@/lib/utils"
import { ShareIcon, ThumbsUpIcon } from "lucide-react"

import LoadMoreContent from "@/components/sections/LoadMoreContent"
import HighlightContents from "@/components/sections/HighlightContents"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"

interface Props {
  params: { slug: string }
}

const TAKE = 12

async function getCreator(userName: string, withContent = true) {
  const data: any = await prisma.creator.findUnique({
    where: {
      userName: "@" + userName,
    },
    include: withContent
      ? {
          contents: {
            take: TAKE,
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              id: true,
              type: true,
              title: true,
              status: true,
              thumbUrl: true,
              updatedAt: true,
              categoryIds: true,
            },
          },
        }
      : undefined,
  })

  if (!data) return null
  return data.contents
    ? {
        ...data,
        contents: data.contents.map((content: any) => {
          const adultContent = content.categoryIds.includes(ADULT_CATEGORY_ID)
          return { ...content, adultContent, categoryIds: undefined }
        }),
      }
    : data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userName = params.slug
  const creator = await getCreator(userName, false)
  if (!creator) return notFound()

  const title = `${creator.name}: Trang chính thức của ${creator.name} trên ${SITE_NAME}`
  const description =
    creator.bio?.slice(0, 255) ??
    `Đây là trang trang cập nhật các nội dung do ${creator.name} đăng tải trên ${SITE_NAME}. Các bạn hãy bấm theo dõi nhóm tại đây nhé!`

  return {
    title: title,
    description: description,
    keywords: [creator.name, slug(creator.name, { replacement: " " }), `${creator.name} trên ${SITE_NAME}`],
    openGraph: {
      title: title,
      locale: "vi_VN",
      type: "website",
      description: description,
      siteName: SITE_URL.origin,
      images: { url: creator.avatar! },
    },
  }
}

export default async function ChannelPage({ params }: Props) {
  const userName = params.slug
  const creator = await getCreator(userName)
  if (!creator) return notFound()

  return (
    <div className="container p-2 sm:px-8 xl:max-w-7xl">
      <div className="grid grid-cols-3 gap-6 w-full p-2">
        <div className="flex flex-col col-span-3 lg:col-span-2">
          <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border">
            {creator.cover && (
              <Image
                width={0}
                height={0}
                sizes="100vh"
                alt={creator.name}
                src={creator.cover}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col items-center sm:items-start sm:flex-row border-b pb-3">
            <Avatar className="w-32 h-32 border-2 border-blue-500 -mt-16 sm:-mt-6 bg-background">
              <AvatarImage src={creator.avatar!} />
              <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
            </Avatar>
            <div className="mt-3 pl-4 w-full flex flex-col gap-1">
              <h1 className="font-bold text-2xl">{creator.name}</h1>
              <div className="text-foreground/80">
                <span>{creator.userName}</span>
                <span className="px-1">&#8226;</span>
                <span>100K người theo dõi</span>
              </div>
              <div className="text-foreground/80">
                <span className="mr-1">Liên hệ:</span>
                <a className="text-blue-500" href={"mailto:" + creator.email}>
                  {creator.email}
                </a>
              </div>
              <p className="text-foreground/70">{creator.bio}</p>

              <div className="flex items-center justify-end text-foreground/70 text-sm mt-1 gap-2">
                <button className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors rounded-md py-1.5 px-4 border">
                  <ThumbsUpIcon size={20} className="stroke-current" />
                  <span className="ml-2">Theo dõi</span>
                </button>
                <button className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-900 transition-colors rounded-md py-1.5 px-4 border">
                  <ShareIcon size={20} className="stroke-current" />
                  <span className="ml-2">Chia sẻ</span>
                </button>
              </div>
            </div>
          </div>

          <HighlightContents
            // @ts-ignore
            data={creator.contents.map((content) => ({
              ...content,
              creator: { name: creator.name, avatar: creator.avatar },
            }))}
            className="mt-6"
            title="Nội dung mới nhất"
          />

          {/* @ts-ignore */}
          <LoadMoreContent creatorId={creator.id} skip={creator.contents.length} take={TAKE} />
        </div>
      </div>
    </div>
  )
}
