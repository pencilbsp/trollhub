import slug from 'slug';
import { Metadata, Viewport } from 'next';
import { notFound, redirect, RedirectType } from 'next/navigation';

import { getSlugId } from '@/lib/utils';

import { getChapter, getChapterMetadata } from '@/actions/chapterActions';

import updateView from '@/lib/update-view';
import ChapterNav from '@/components/ChapterNav';
import NextChapter from '@/components/NextChapter';
import { ComicViewer } from '@/components/comic-viewer';
import { TooltipProvider } from '@/components/ui/Tooltip';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

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

    const link = `/chapter/${slug(chapter.content.title.trim())}-${slug(chapter.title.trim())}-${chapter.id}`;

    if (!link.includes(params.slug)) {
        return redirect(link, RedirectType.push);
    }

    updateView(chapter.id, 'chapter');

    return (
        <TooltipProvider>
            <div className="container px-4 xl:max-w-6xl">
                <div className="my-4 md:my-3 relative">
                    <ChapterNav id={chapter.id} title={chapter.title} contentType={chapter.type} contentId={chapter.content.id} contentTitle={chapter.content.title} />
                </div>

                <ComicViewer chapter={chapter} />
            </div>

            <NextChapter title={chapter.title} chapterId={chapter.id} contentId={chapter.content.id} />
        </TooltipProvider>
    );
}
