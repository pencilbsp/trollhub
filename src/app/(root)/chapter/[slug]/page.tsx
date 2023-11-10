import { notFound } from "next/navigation";

import Image from "next/image";
import prisma from "@/lib/prisma";

import ChapterNav from "@/components/ChapterNav";
import { TooltipProvider } from "@/components/ui/Tooltip";

interface Props {
  params: { slug: string };
}

async function getChapter(id: string) {
  return prisma.chapter.findUnique({
    where: {
      id,
    },
    include: {
      content: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = params.slug.slice(-24);
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

        <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
          {chapter.images.map((img, index) => (
            <Image
              alt={""}
              src={img}
              width={0}
              height={0}
              unoptimized
              sizes="100vh"
              className="w-full"
              key={chapter.id + index}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
