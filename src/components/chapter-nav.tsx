'use client';

import slug from 'slug';
import Link from 'next/link';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ContentType } from '@prisma/client';
import { ArrowUpIcon, ListIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import useHistory from '@/hooks/use-history';
import useChapters from '@/hooks/use-chapters';
import useOffSetTop from '@/hooks/use-offset-top';
import useResponsive from '@/hooks/use-responsive';

import { createHistory } from '@/actions/guest/history-actions';
import ChapterIcon from '@/components/icons/chapter-icon';
import ChapterList from '@/components/sections/guest/chapter-list';
import CircleProgressIcon from '@/components/icons/circle-progress-icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
    id: string;
    title: string;
    contentId: string;
    contentTitle: string;
    contentType: ContentType;
}

const scrollToTop = (smooth: boolean = false) => {
    if (typeof document === 'undefined') return;

    if (smooth) window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.documentElement.scrollTop = 0;
};

export default function ChapterNav({ id, title, contentTitle, contentId, contentType }: Props) {
    const session = useSession();
    const offset = useOffSetTop(64);
    const { upadteHistory } = useHistory();

    const [drawer, setDrawer] = useState(false);
    const { chapters, isLoading, onFilter, total } = useChapters(contentId);

    const href = `/${contentType}/${slug(contentTitle)}-${contentId}`;

    const { percent, chapterIdx } = useMemo(() => {
        // @ts-ignore
        const chapterIdx = chapters.findIndex((c: any) => id === c.id);
        const percent = chapters.length ? ((chapters.length - chapterIdx) / chapters.length) * 100 : 0;
        return { chapterIdx, percent };
    }, [chapters, id]);

    const isMobile = useResponsive('down', 'md');

    useEffect(() => {
        setDrawer(isMobile);
    }, [isMobile]);

    useEffect(() => {
        const handleHistory = async () => {
            const { error, history } = await createHistory(contentId, id);
            if (error) return toast.error(error.message);
            // @ts-ignore
            upadteHistory(history);
        };

        session.data?.user.id && handleHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentId, id, session.data?.user.id]);

    return (
        <motion.aside className={cn('chapter-nav z-10', offset && 'stickied')}>
            <nav>
                {drawer ? (
                    <Drawer.Root>
                        <Drawer.Trigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-500/25">
                                <ListIcon size={20} />
                            </button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                            <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex flex-col rounded-t-[10px] bg-background/75 backdrop-blur">
                                <ChapterList
                                    currentId={id}
                                    // @ts-ignore
                                    chapters={chapters}
                                    onFilter={onFilter}
                                    isLoading={isLoading}
                                    contentTitle={contentTitle}
                                />
                            </Drawer.Content>
                        </Drawer.Portal>
                    </Drawer.Root>
                ) : (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-500/25">
                                <ListIcon size={20} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={26}
                            alignOffset={-12}
                            className="w-[540px] overflow-hidden rounded-xl bg-background/80 p-0 shadow backdrop-blur-xl"
                        >
                            <ChapterList
                                currentId={id}
                                // @ts-ignore
                                chapters={chapters}
                                onFilter={onFilter}
                                contentTitle={contentTitle}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </nav>

            <div className="ml-1 mr-2 hidden h-8 w-[1px] bg-gray-400/25 md:block"></div>

            <ChapterIcon className="mr-3 hidden lg:block" />
            <div className="flex w-full items-center gap-3 overflow-hidden">
                <div className="w-full flex-shrink-0 flex-grow">
                    <Link href={href}>
                        <h2 className="truncate text-sm md:text-base">{contentTitle}</h2>
                    </Link>
                    <h1 className="truncate text-xs text-foreground/60 md:text-sm">{title}</h1>
                </div>
            </div>

            <div className="ml-auto mr-3 hidden flex-shrink-0 flex-grow flex-col items-end md:flex">
                <p>{percent.toFixed(0)}%</p>
                <p className="text-sm font-light text-foreground/60">
                    {/* @ts-ignore */}
                    {total - chapterIdx}/{total} chương
                </p>
            </div>

            <div className="flex aspect-square w-6 flex-shrink-0 flex-grow items-center md:w-8">
                <CircleProgressIcon value={percent} />
            </div>

            <div className="ml-2 mr-1 hidden h-8 w-[1px] bg-gray-400/25 md:block"></div>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => scrollToTop(true)}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-500/25"
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
