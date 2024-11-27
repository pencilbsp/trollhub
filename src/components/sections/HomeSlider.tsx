"use client";

import slug from "slug";
import Link from "next/link";
import Image from "next/image";

import { ContentType } from "@prisma/client";

// Swiper components, modules and styles
import { cn } from "@/lib/utils";
import useSettings from "@/hooks/useSettings";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";

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
  data: Slide[];
}

export default function HomeSlider({ data }: Props) {
  const { showAdultContent } = useSettings();

  return (
    <SwiperReact
      autoplay
      navigation
      className="h-full w-full sm:rounded-lg"
      modules={[Autoplay, Navigation, Pagination]}
      pagination={{ type: "bullets", clickable: true }}
    >
      {data.map(({ id, image, tagline, title, type, adultContent }) => {
        const href = `/${type}/${slug(title)}-${id}`;
        const isShow = adultContent && !showAdultContent;

        return (
          <SwiperSlide key={id} className="w-full aspect-[21/10]">
            <Link href={href} passHref>
              <div className="w-full h-full absolute left-0 top-0 flex justify-center">
                <div
                  className="absolute inset-0 blur-lg"
                  style={{
                    background: `url(${image}) center center / cover scroll no-repeat`,
                  }}
                />
                <Image
                  width={0}
                  height={0}
                  src={image}
                  alt={title}
                  sizes="100vw"
                  className={cn("absolute h-full w-auto", isShow && "blur-lg")}
                />
              </div>

              <div className="h-full w-full absolute left-0 top-0 bg-black opacity-20" />
              <div className="relative z-10 h-full flex items-end p-4 sm:p-8">
                <div className="flex flex-col mb-2">
                  <p className="text-xl sm:text-2xl lg:text-4xl font-bold text-white hover:underline">
                    {title}
                  </p>
                  {tagline && (
                    <p className="text-md sm:text-xl lg:text-2xl font-semibold text-white sm:pt-2">
                      {tagline}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        );
      })}
    </SwiperReact>
  );
}
