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

async function getImages(chapter: NonNullable<Awaited<ReturnType<typeof getChapter>>>): Promise<string[]> {
  try {
    if (chapter.type === "novel") return chapter.text ? [chapter.text] : []

    const response = await fetch(`${USER_CONTENTS_HOST}/api/fttps:webp/${chapter.fid}`)
    const data = await response.json()

    if (!data.images || data.images.length === 0) throw new Error()
    return data.images.map((i: string) => `${USER_CONTENTS_HOST}/images/${chapter.fid}/${i}`)
  } catch (error) {
    console.log(error)
    if (!chapter.images) return []

    return chapter.images.map((img) => {
      const { pathname, search } = new URL(img)
      return `${pathname}${search}`
    })
  }
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = getSlugId(params.slug)
  const chapter = await getChapter(chapterId)
  if (!chapter) return notFound()

  const images = await getImages(chapter)

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

        {images.length === 0 ? (
          <div className="border border-dashed px-4 py-8 flex flex-col gap-4 items-center justify-center rounded-xl">
            <p className="text-lg font-semibold text-center">
              Nội dung không khả dụng ngay bây giờ, vui lòng quay lại sau. Xin cám ơn!
            </p>
            <ReloadButton id={chapter.id} status={chapter.status} />
          </div>
        ) : chapter.type === "comic" ? (
          <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
            {images.map((img, index) => {
              return <Image alt="" src={img} effect="blur" tmpRatio="1/1" threshold={2400} key={chapter.id + index} />
            })}
          </div>
        ) : (
          <div className="sm:mx-auto max-w-3xl font-semibold text-xl">
            <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">{images[0]}</p>
          </div>
        )}
      </div>

      <NextChapter title={chapter.title} chapterId={chapter.id} contentId={chapter.content.id} />
    </TooltipProvider>
  )
}
