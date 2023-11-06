"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
// Swiper components, modules and styles
import { Navigation, Pagination } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ContentCard, { ContentWithCreator } from "@/components/ContentCard";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  swiper?: boolean;
  moreLink?: string;
  className?: string;
  data?: ContentWithCreator[];
}

export default function HighlightContents({ title, moreLink, data, swiper, className }: Props) {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold uppercase text-2xl">{title}</h2>
        {moreLink && (
          <Link href={moreLink} className="flex items-center hover:text-blue-500 transition-colors">
            <span className="mr-1">Xem tất cả</span>
            <ArrowRightIcon className="w-5 h-5 fill-current" />
          </Link>
        )}
      </div>

      {swiper ? (
        <SwiperReact
          slidesPerView={4}
          spaceBetween={16}
          navigation
          modules={[Navigation, Pagination]}
          className="h-full w-full"
        >
          {data &&
            data.map((content) => (
              <SwiperSlide key={content.id} className="h-full">
                <ContentCard data={content} direction="vertical" />
              </SwiperSlide>
            ))}
        </SwiperReact>
      ) : (
        <div className="grid grid-cols-2 grid-rows-4 sm:grid-cols-3 sm:grid-rows-3 lg:grid-cols-4 lg:grid-rows-2 gap-4 md:gap-2 xl:gap-4 w-full">
          {data && data.map((content) => <ContentCard direction="vertical" key={content.id} data={content} />)}
        </div>
      )}
    </div>
  );
}
