import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSlugId } from "@/lib/utils"

import { USER_CONTENTS_HOST } from "@/config"
import { getChapter, getChapterMetadata } from "@/actions/chapterActions"

import Image from "@/components/Image"
import ReloadButton from "./ReloadButton"
import ChapterNav from "@/components/ChapterNav"
import NextChapter from "@/components/NextChapter"
import { TooltipProvider } from "@/components/ui/Tooltip"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapterId = getSlugId(params.slug)
  const metadata = await getChapterMetadata(chapterId)
  if (!metadata) return notFound()

  return metadata
}

async function getImages(chapter: NonNullable<Awaited<ReturnType<typeof getChapter>>>) {
  try {
    const response = await fetch(`${USER_CONTENTS_HOST}/api/fttps:webp/${chapter.fid}`)
    const data = await response.json()
    if (data.images.length) {
      return data.images.map((i: string) => `${USER_CONTENTS_HOST}/public/images/${chapter.fid}/${i}`)
    }
    return chapter.images
  } catch (error) {
    return chapter.images
  }
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = getSlugId(params.slug)
  const chapter = await getChapter(chapterId)
  if (!chapter) return notFound()

  // if (chapter.mobileOnly && chapter.type === "comic")
  //   return (
  //     <div className="container px-4 xl:max-w-6xl">
  //       <div className="border border-dashed px-4 py-8 flex flex-col gap-4 items-center justify-center rounded-xl">
  //         <p className="text-lg font-semibold text-center">
  //           Nội dung không khả dụng ngay bây giờ, vui lòng quay lại sau. Xin cám ơn!
  //         </p>
  //       </div>
  //     </div>
  //   )

  const images: string[] = await getImages(chapter)

  return (
    <TooltipProvider>
      <div className="container px-4 xl:max-w-6xl">
        <div className="my-4 md:my-3 relative">
          <ChapterNav
            id={chapter.id}
            title={chapter.title!}
            contentType={chapter.type}
            contentId={chapter.content.id}
            contentTitle={chapter.content.title}
          />
        </div>

        {!images.length ? (
          <div className="border border-dashed px-4 py-8 flex flex-col gap-4 items-center justify-center rounded-xl">
            <p className="text-lg font-semibold text-center">
              Nội dung không khả dụng ngay bây giờ, vui lòng quay lại sau. Xin cám ơn!
            </p>
            <ReloadButton id={chapter.id} status={chapter.status} />
          </div>
        ) : chapter.type === "comic" ? (
          <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
            {images.map((img, index) => {
              // const { pathname, search } = new URL(img)
              return <Image alt="" src={img} effect="blur" tmpRatio="1/1" threshold={1200} key={chapter.id + index} />
            })}
          </div>
        ) : (
          <div className="sm:mx-auto max-w-3xl font-semibold text-xl">
            <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">{chapter.text}</p>
          </div>
        )}
      </div>

      <NextChapter title={chapter.title} chapterId={chapter.id} contentId={chapter.content.id} />
    </TooltipProvider>
  )
}
