"use client";

import slug from "slug";
import Link from "next/link";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ContentType } from "@prisma/client";
import { ArrowUpIcon, ListIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import useHistory from "@/hooks/useHistory";
import useChapters from "@/hooks/useChapters";
import useOffSetTop from "@/hooks/useOffSetTop";
import useResponsive from "@/hooks/useResponsive";

import { createHistory } from "@/actions/historyActions";
import ChapterIcon from "@/components/icons/ChapterIcon";
import ChapterList from "@/components/sections/ChapterList";
import CircleProgressIcon from "@/components/icons/CircleProgressIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";

interface Props {
  id: string;
  title: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
}

const scrollToTop = (smooth: boolean = false) => {
  if (typeof document === "undefined") return;

  if (smooth) window.scrollTo({ top: 0, behavior: "smooth" });
  else document.documentElement.scrollTop = 0;
};

export default function ChapterNav({ id, title, contentTitle, contentId, contentType }: Props) {
  const { data } = useSession();
  const offset = useOffSetTop(64);
  const { upadteHistory } = useHistory();

  const [drawer, setDrawer] = useState(false);
  const { chapters } = useChapters(contentId);

  const href = `/${contentType}/${slug(contentTitle)}-${contentId}`;

  const { percent, chapterIdx } = useMemo(() => {
    const chapterIdx = chapters.findIndex((c) => id === c.id);
    const percent = ((chapters.length - chapterIdx) / chapters.length) * 100;
    return { chapterIdx, percent };
  }, [chapters, id]);

  const isMobile = useResponsive("down", "md");

  useEffect(() => {
    setDrawer(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const handleHistory = async () => {
      const { error, history } = await createHistory(contentId, id);
      if (error) return toast.error(error.message);
      upadteHistory(history);
    };

    data?.user.id && handleHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, id, data?.user.id]);

  return (
    <motion.aside
      className={cn(
        "h-[52px] md:h-[67px] bg-muted/80 dark:bg-background/80 dark:border flex px-3 py-1 md:p-3 rounded-full items-center w-full gap-x-2 backdrop-blur-xl",
        offset && "fixed top-4 border shadow-lg max-w-[calc(100%-32px)] xl:max-w-[1120px]"
      )}
    >
      <nav>
        {drawer ? (
          <Drawer.Root>
            <Drawer.Trigger>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/25 transition-colors">
                <ListIcon size={20} />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="backdrop-blur-xl bg-background/80 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0">
                <ChapterList chapters={chapters} currentId={id} contentId={contentId} contentTitle={contentTitle} />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        ) : (
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
              <ChapterList chapters={chapters} currentId={id} contentId={contentId} contentTitle={contentTitle} />
            </PopoverContent>
          </Popover>
        )}
      </nav>

      <div className="h-8 mr-2 ml-1 w-[1px] bg-gray-400/25 hidden md:block"></div>

      <ChapterIcon className="hidden lg:block mr-3" />
      <div className="flex items-center gap-3 w-full overflow-hidden">
        <div className="flex-shrink-0 flex-grow w-full">
          <Link href={href}>
            <h2 className="truncate text-sm md:text-base">{contentTitle}</h2>
          </Link>
          <h1 className="truncate text-foreground/60 text-xs md:text-sm">{title}</h1>
        </div>
      </div>

      <div className="flex-shrink-0 flex-grow ml-auto mr-3 flex-col items-end hidden md:flex">
        <p>{percent.toFixed(0)}%</p>
        <p className="text-foreground/60 text-sm font-light">
          {chapters.length - chapterIdx}/{chapters.length} chương
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
