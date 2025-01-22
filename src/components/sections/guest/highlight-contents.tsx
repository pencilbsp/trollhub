'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { cn } from '@/lib/utils';
import { type HighlightContent } from '@/actions/guest/home-actions';

import { ContentVertical } from '@/components/content-card';

interface Props {
    title: string;
    swiper?: boolean;
    moreLink?: string;
    className?: string;
    data?: HighlightContent[];
}

export default function HighlightContents({ title, moreLink, data, swiper, className }: Props) {
    return (
        <div className={cn('flex w-full flex-col', className)}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold uppercase">{title}</h2>
                {moreLink && (
                    <Link href={moreLink} className="flex items-center transition-colors hover:text-blue-500">
                        <span className="mr-1">Xem tất cả</span>
                        <ArrowRightIcon className="h-5 w-5 fill-current" />
                    </Link>
                )}
            </div>

            {swiper ? (
                <SwiperReact slidesPerView={4} spaceBetween={16} navigation modules={[Navigation, Pagination]} className="h-full w-full">
                    {data &&
                        data.map((content) => (
                            <SwiperSlide key={content.id} className="h-full">
                                <ContentVertical data={content} />
                            </SwiperSlide>
                        ))}
                </SwiperReact>
            ) : (
                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:gap-2 lg:grid-cols-4 xl:gap-4">
                    {data && data.map((content) => <ContentVertical key={content.id} data={content} />)}
                </div>
            )}
        </div>
    );
}
