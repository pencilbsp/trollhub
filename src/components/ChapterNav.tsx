"use client";

import slug from "slug";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { ContentType } from "@prisma/client";
import { ArrowUpIcon, ListIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import useOffSetTop from "@/hooks/useOffSetTop";

import getChapters from "@/actions/getChapters";
import ChapterIcon from "@/components/icons/ChapterIcon";
import CircleProgressIcon from "@/components/icons/CircleProgressIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

  const offset = useOffSetTop(64);
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
        "h-[52px] md:h-[67px] bg-muted/80 dark:bg-background/80 dark:border flex px-3 py-1 md:p-3 rounded-full items-center w-full gap-x-2 backdrop-blur-xl",
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
          <PopoverContent
            align="start"
            sideOffset={26}
            alignOffset={-12}
            className="rounded-xl shadow w-[540px]  p-0 overflow-hidden backdrop-blur-xl bg-background/80"
          >
            <div className="m-3">
              <h4 className="font-bold text-xl uppercase">Danh sách chương</h4>
            </div>
            <div className="max-h-80 w-full overflow-y-auto mb-3">
              <ul className="px-3 w-full text-sm font-mono flex flex-col divide-y">
                {chapters.map((chap) => {
                  const isCurrent = chap.id === id;
                  return (
                    <li
                      key={chap.id}
                      className={cn(
                        "flex justify-between p-2 gap-x-4 hover:bg-foreground/10",
                        isCurrent && "bg-foreground/10 text-blue-500"
                      )}
                    >
                      <Link className="truncate" href={`/chapter/${slug(contentTitle)}-${chap.id}`}>
                        {chap.title}
                      </Link>
                      <time className="font-mono font-light text-sm flex-shrink-0">
                        {format(chap.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </nav>

      <div className="h-8 mr-2 ml-1 w-[1px] bg-gray-400/25 hidden md:block"></div>

      <ChapterIcon className="hidden lg:block mr-3" />
      <div className="flex items-center gap-3 w-full overflow-hidden">
        <div className="flex-shrink-0 flex-grow w-full">
          <h2 className="truncate text-sm md:text-base">{contentTitle}</h2>
          <h1 className="truncate text-foreground/60 text-xs md:text-sm">{title}</h1>
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
