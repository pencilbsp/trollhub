import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSlugId } from "@/lib/utils";

import { getChapter, getChapterMetadata } from "@/actions/chapterActions";

import ChapterNav from "@/components/ChapterNav";
import NextChapter from "@/components/NextChapter";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { ComicViewer, ComicViewerLoading } from "@/components/comic-viewer";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapterId = getSlugId(params.slug);
  const metadata = await getChapterMetadata(chapterId);
  if (!metadata) return notFound();

  return metadata;
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = getSlugId(params.slug);
  const chapter = await getChapter(chapterId);
  if (!chapter) return notFound();

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

        <Suspense fallback={<ComicViewerLoading />}>
          <ComicViewer chapter={chapter} />
        </Suspense>
        {/* <ComicViewerLoading /> */}
      </div>

      <NextChapter
        title={chapter.title}
        chapterId={chapter.id}
        contentId={chapter.content.id}
      />
    </TooltipProvider>
  );
}
