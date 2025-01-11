'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Button } from './ui/button';
import { generateHref } from '@/lib/utils';
import useChapters from '@/hooks/useChapters';

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
        <div className="relative mx-auto mb-8 mt-4 flex gap-6 w-full max-w-[640px] flex-col items-center px-4 md:my-20 md:mt-12">
            <div aria-hidden="true" className="mx-auto h-32 w-[1px] bg-gradient-to-t from-blue-300 md:h-48" />
            <h3 className="text-2xl text-center font-bold mt-2">Hết chương: {currentTitle}</h3>

            {nextChapter && (
                <div className="border border-muted w-full flex flex-col items-center gap-3 rounded-xl px-4 py-8">
                    <p className="text-center text-muted-foreground">Chương tiếp theo</p>
                    <p className="text-center font-bold text-lg">{nextChapter.title}</p>

                    <Button asChild className="flex items-center justify-center text-lg" size="lg">
                        <Link href={nextChapter.href}>
                            Đọc chương tiếp theo
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
