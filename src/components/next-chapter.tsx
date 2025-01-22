'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Button } from './ui/button';
import { generateHref } from '@/lib/utils';
import useChapters from '@/hooks/use-chapters';

type Props = {
    chapterId: string;
    contentId: string;
    contentTitle: string;
    currentTitle: string | null;
};

export default function NextChapter({ chapterId, currentTitle, contentId, contentTitle }: Props) {
    const { chapters } = useChapters(contentId);

    const nextChapter = useMemo(() => {
        const index = chapters.findIndex(({ id }) => id === chapterId);
        if (index < 0) return null;

        const chapter = chapters[index - 1];
        if (!chapter) return null;

        const href = generateHref({ type: chapter.type, id: chapter.id, contentTitle, title: chapter.title });
        return { ...chapter, href };
    }, [chapters, chapterId, contentTitle]);

    return (
        <div className="relative mx-auto mb-8 mt-4 flex w-full max-w-[640px] flex-col items-center gap-6 px-4 md:my-20 md:mt-12">
            <div aria-hidden="true" className="mx-auto h-32 w-[1px] bg-gradient-to-t from-blue-300 md:h-48" />
            <h3 className="mt-2 text-center text-2xl font-bold">Hết chương: {currentTitle}</h3>

            {nextChapter && (
                <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-muted px-4 py-8">
                    <p className="text-center text-muted-foreground">Chương tiếp theo</p>
                    <p className="text-center text-lg font-bold">{nextChapter.title}</p>

                    <Button asChild className="flex items-center justify-center text-lg" size="lg">
                        <Link href={nextChapter.href}>
                            Đọc chương tiếp theo
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
