import { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';

import { getSlugId } from '@/lib/utils';

import { getChapter, getChapterMetadata } from '@/actions/guest/chapter-actions';

import updateView from '@/lib/update-view';
import ChapterNav from '@/components/chapter-nav';
import NextChapter from '@/components/next-chapter';
import { ComicViewer } from '@/components/comic-viewer';
import { TooltipProvider } from '@/components/ui/tooltip';

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

    const content = chapter.content;

    // const paramsSlug = generateHref({ contentTitle: content.title, title: chapter.title, id: chapter.id });

    // if (paramsSlug !== params.slug) {
    //     return redirect(`/chapter/${paramsSlug}`);
    // }

    updateView(chapter.id, 'chapter');

    return (
        <TooltipProvider>
            <div className="container px-4 xl:max-w-6xl">
                <div className="my-4 md:my-3 relative">
                    <ChapterNav id={chapter.id} title={chapter.title} contentType={chapter.type} contentId={content.id} contentTitle={content.title} />
                </div>

                <ComicViewer chapter={chapter} />
            </div>

            <NextChapter currentTitle={chapter.title} chapterId={chapter.id} contentId={content.id} contentTitle={content.title} />
        </TooltipProvider>
    );
}
