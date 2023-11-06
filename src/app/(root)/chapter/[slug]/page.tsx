import { notFound } from "next/navigation";
import { ListIcon, ArrowUpIcon } from "lucide-react";

import prisma from "@/lib/prisma";
import ChapterIcon from "@/components/icons/ChapterIcon";
import CircleProgressIcon from "@/components/icons/CircleProgressIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from "@/components/ui/Tooltip";

interface Props {
  params: { slug: string };
}

async function getChapter(id: string) {
  return prisma.chapter.findUnique({
    where: {
      id,
    },
  });
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = params.slug.slice(-24);
  const chapter = await getChapter(chapterId);

  if (!chapter) return notFound();

  let chapterName, chapterDescription;
  const chapTitle = chapter.title?.split(":");
  if (chapTitle) (chapterName = chapTitle[0]), (chapterDescription = chapTitle[1]);

  return (
    <div className="container p-2 sm:px-4 xl:max-w-5xl">
      <div className="xl:-mx-12 mb-8 h-[67px] mt-6">
        <aside className="bg-gray-100 dark:bg-background dark:border flex p-3 rounded-full items-center">
          <nav>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/25 transition-colors">
                    <ListIcon size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Danh sách các chương</p>
                  <TooltipArrow className="dark:fill-white" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
          <div className="h-8 mr-4 ml-3 w-[1px] bg-gray-400/25"></div>
          <div className="flex items-center gap-3 w-full">
            <ChapterIcon className="hidden md:block" />

            <div className="">
              <h3>{chapterName}</h3>
              <h2 className="text-foreground/60 text-sm">{chapterDescription}</h2>
            </div>

            <div className="ml-auto flex-col items-end hidden md:flex">
              <p>25%</p>
              <p className="text-foreground/60 text-sm font-light">4/16 chapters</p>
            </div>

            <div className="ml-auto md:ml-0 w-9 h-9">
              <CircleProgressIcon />
            </div>
          </div>
          <div className="h-8 mr-3 ml-4 w-[1px] bg-gray-400/25"></div>
          <div className="">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/25 transition-colors">
                    <ArrowUpIcon size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lên đầu trang</p>
                  <TooltipArrow className="dark:fill-white" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </aside>
      </div>
    </div>
  );
}
