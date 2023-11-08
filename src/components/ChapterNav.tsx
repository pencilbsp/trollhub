"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { ArrowUpIcon, ListIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import getChapters from "@/actions/getChapters";
import ChapterIcon from "@/components/icons/ChapterIcon";
import CircleProgressIcon from "@/components/icons/CircleProgressIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";

import { ContentType } from "@prisma/client";
import useOffSetTop from "@/hooks/useOffSetTop";

interface Props {
  id: string;
  title: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
}

const fetcher = (id: string) => getChapters(id, { orderBy: { createdAt: "desc" } });

export default function ChapterNav({ id, title, contentTitle, contentId, contentType }: Props) {
  const { data: chapters } = useSWR(`${contentId}|chapter`, fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  const offset = useOffSetTop(97 - 16);
  const chapterIndex = chapters.findIndex((chapter) => id === chapter.id);
  const percent = ((chapters.length - chapterIndex) / chapters.length) * 100;

  const scrollToTop = (smooth: boolean = false) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      document.documentElement.scrollTop = 0;
    }
  };

  return (
    <motion.aside
      className={cn(
        "h-[52px] md:h-[67px] bg-muted dark:bg-background dark:border flex px-3 py-1 md:p-3 rounded-full items-center w-full gap-x-2",
        offset && "fixed top-4 border shadow-lg max-w-[calc(100%-32px)] xl:max-w-[1120px]"
      )}
    >
      <nav>
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/25 transition-colors">
              <ListIcon size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="rounded-xl shadow min-w-[540px]" align="start" alignOffset={-12} sideOffset={28}>
            
          </PopoverContent>
        </Popover>
      </nav>

      <div className="h-8 mr-2 ml-1 w-[1px] bg-gray-400/25 hidden md:block"></div>

      <ChapterIcon className="hidden lg:block mr-3" />
      <div className="flex items-center gap-3 w-full overflow-hidden">
        <div className="flex-shrink-0 flex-grow w-full">
          <h1 className="truncate text-sm md:text-base">{contentTitle}</h1>
          <h2 className="truncate text-foreground/60 text-xs md:text-sm">{title}</h2>
        </div>
      </div>

      <div className="flex-shrink-0 flex-grow ml-auto mr-3 flex-col items-end hidden md:flex">
        <p>{percent.toFixed(0)}%</p>
        <p className="text-foreground/60 text-sm font-light">
          {chapters.length - chapterIndex}/{chapters.length} chương
        </p>
      </div>

      <div className="flex-shrink-0 flex-grow flex items-center aspect-square w-6 md:w-8">
        <CircleProgressIcon value={percent} />
      </div>

      <div className="h-8 mr-1 ml-2 w-[1px] bg-gray-400/25 hidden md:block"></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => scrollToTop(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/25 transition-colors flex-shrink-0"
          >
            <ArrowUpIcon size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Lên đầu trang</p>
          <TooltipArrow className="dark:fill-white" />
        </TooltipContent>
      </Tooltip>
    </motion.aside>
  );
}
