import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { generateContentMetadata, getSlugId } from '@/lib/utils';

import { PageParams } from '@/types/page';
import updateView from '@/lib/update-view';
import { getContent } from '@/actions/guest/content-actions';
import ContentPage from '@/components/sections/guest/content-page';

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const contentId = getSlugId(params.slug);
    const data = await getContent(contentId);
    if (!data) return notFound();

    return generateContentMetadata(data);
}

export default async function ComicPage({ params }: PageParams) {
    const contentId = getSlugId(params.slug);
    const data = await getContent(contentId);
    if (!data) return notFound();

    updateView(data.id, 'content');

    return <ContentPage data={data} />;
}
