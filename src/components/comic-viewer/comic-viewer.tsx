'use client';

import useSWR from 'swr';
import { Fragment } from 'react';

import { USER_CONTENTS_HOST } from '@/config';

import Image from '@/components/image';
import ReloadButton from './reload-button';
import RequestButton from '../request-button';
import ComicViewerLoading from './comic-viewer-loading';
import { type Chapter } from '@/actions/guest/chapter-actions';

type Props = {
    chapter: Chapter;
};

export default function ComicViewer({ chapter }: Props) {
    const {
        mutate,
        isLoading,
        data: images,
    } = useSWR(
        chapter.fid,
        async (fid: string) => {
            try {
                const response = await fetch(`${USER_CONTENTS_HOST}/api/fttps:webp/${fid}`);
                const data = await response.json();
                return data.images;
            } catch (error) {
                return [];
            }
        },
        { revalidateOnFocus: false },
    );

    if (isLoading) return <ComicViewerLoading />;

    return (
        <Fragment>
            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-4 py-8">
                    <p className="text-center text-lg font-semibold">Nội dung không khả dụng ngay bây giờ, vui lòng quay lại sau. Xin cám ơn!</p>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <RequestButton chapterId={chapter.id} />
                        <ReloadButton fid={chapter.fid} id={chapter.id} mutate={mutate} />
                    </div>
                </div>
            ) : chapter.type === 'comic' ? (
                <div className="-mx-4 max-w-3xl overflow-hidden rounded-xl border sm:mx-auto">
                    {images.map((img: string, index: number) => {
                        return <Image alt="" src={img} effect="blur" tmpRatio="1/1" threshold={2400} key={chapter.id + index} />;
                    })}
                </div>
            ) : (
                <div className="max-w-3xl text-xl font-semibold sm:mx-auto">
                    <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">{images[0]}</p>
                </div>
            )}
        </Fragment>
    );
}
