'use client';

import Link from 'next/link';
import Image from 'next/image';

import { ContentType } from '@prisma/client';

// Swiper components, modules and styles
import { cn, generateHref } from '@/lib/utils';
import useSettings from '@/hooks/use-settings';
import { type HomeData } from '@/actions/guest/home-actions';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';

export interface Slide {
    id: string;
    title: string;
    image: string;
    tagline: string;
    type: ContentType;
    adultContent: boolean;
    buttons?: ButtonProps[];
}

interface ButtonProps {
    id: number;
    text: string;
    link: string;
    type: string;
}

interface Props {
    data: HomeData['slide'];
}

export default function HomeSlider({ data }: Props) {
    const { showAdultContent } = useSettings();

    return (
        <SwiperReact autoplay navigation className="h-full w-full sm:rounded-lg" modules={[Autoplay, Navigation, Pagination]} pagination={{ type: 'bullets', clickable: true }}>
            {data.map(({ id, image, tagline, title, type, adultContent }) => {
                const href = generateHref({ id, title, type });
                const isShow = adultContent && !showAdultContent;

                return (
                    <SwiperSlide key={id} className="aspect-[21/10] w-full">
                        <Link href={href} passHref>
                            <div className="absolute left-0 top-0 flex h-full w-full justify-center">
                                <div
                                    className="absolute inset-0 blur-lg"
                                    style={{
                                        background: `url(${image}) center center / cover scroll no-repeat`,
                                    }}
                                />
                                <Image unoptimized width={0} height={0} src={image} alt={title} sizes="100vw" className={cn('absolute h-full w-auto', isShow && 'blur-lg')} />
                            </div>

                            <div className="absolute left-0 top-0 h-full w-full bg-black opacity-20" />
                            <div className="relative z-10 flex h-full items-end p-4 sm:p-8">
                                <div className="mb-2 flex flex-col">
                                    <p className="text-xl font-bold text-white hover:underline sm:text-2xl lg:text-4xl">{title}</p>
                                    {tagline && <p className="text-md font-semibold text-white sm:pt-2 sm:text-xl lg:text-2xl">{tagline}</p>}
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                );
            })}
        </SwiperReact>
    );
}
