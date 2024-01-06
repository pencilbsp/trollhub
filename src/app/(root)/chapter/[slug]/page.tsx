import Image from "next/image"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getSlugId } from "@/lib/utils"

import { getChapter, getChapterMetadata } from "@/actions/chapterActions"

import { USER_CONTENTS_HOST } from "@/config"
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

export default async function ChapterPage({ params }: Props) {
  const chapterId = getSlugId(params.slug)
  const chapter = await getChapter(chapterId)
  if (!chapter) return notFound()

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

        {chapter.type === "comic" && (
          <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
            {chapter.images.map((img, index) => {
              const { pathname, search } = new URL(img)
              return (
                <Image
                  alt={""}
                  width={0}
                  height={0}
                  unoptimized
                  sizes="100vh"
                  loading="lazy"
                  className="w-full"
                  key={chapter.id + index}
                  src={`${pathname}${search}`}
                />
              )
            })}
          </div>
        )}

        {chapter.type === "novel" && (
          <div className="sm:mx-auto max-w-3xl font-semibold text-xl">
            <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">{chapter.text}</p>
          </div>
        )}
      </div>

      <NextChapter title={chapter.title} chapterId={chapter.id} contentId={chapter.content.id} />
    </TooltipProvider>
  )
}
