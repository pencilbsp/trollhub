import slug from "slug";
import { Category } from "@prisma/client";

import CategoryList from "@/components/sections/CategoryList";
import HomeSlider, { Slide } from "@/components/sections/HomeSlider";
import HighlightContents from "@/components/sections/HighlightContents";
// utils
import prisma from "@/lib/prisma";
import { ADULT_CATEGORY_ID, NATIVE_ADS_ID } from "@/config";
import getRedisClient, { getKeyWithNamespace } from "@/lib/redis";
import NativeAds from "@/components/ads/NativeAds";

const EX = 30 * 60; // 30 Phút

const get = async (slug: string) => {
  const data = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      contents: {
        take: 8,
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          thumbUrl: true,
          updatedAt: true,
          categoryIds: true,
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!data) throw new Error();

  return {
    ...data,
    contents: data.contents.map((content) => {
      const adultContent = content.categoryIds.includes(ADULT_CATEGORY_ID);
      return { ...content, adultContent, categoryIds: undefined };
    }),
  };
};

type HomeData = {
  slide: Slide[];
  highlights: Awaited<ReturnType<typeof get>>[];
  categories: Category[];
};

async function getHomeData(): Promise<HomeData> {
  const redisClient = await getRedisClient();
  const key = getKeyWithNamespace("home-data");
  let homeData: any = await redisClient.get(key);

  if (!homeData) {
    const highlights = await Promise.all(
      [
        "fh-sentimental",
        "fh-tieu-thuyet",
        "fh-tv-show",
        "fh-boys-love",
        "fh-girls-love",
        "fh-truyen-nam",
        "fh-modern",
        "fh-historical-drama",
        "fh-romance",
      ].map((slug) => get(slug))
    );

    const categories = await prisma.category.findMany({
      where: {},
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    const contents = await prisma.content.findMany({
      where: {},
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        categories: true,
      },
      take: 6,
    });

    const slide: Slide[] = contents.map((content) => ({
      id: content.id,
      type: content.type,
      title: content.title,
      tagline: content.akaTitle[0],
      image: content.thumbUrl!.replace("_256x", "_720x"),
    }));

    homeData = { slide, highlights, categories };
    await redisClient.set(key, JSON.stringify(homeData), { EX });
  } else {
    homeData = JSON.parse(homeData);
  }

  return homeData;
}

export default async function Home() {
  const { slide, highlights, categories } = await getHomeData();

  return (
    <main className="flex flex-col gap-6 items-center justify-between">
      <div className="w-full sm:container xl:max-w-7xl">
        <div className="sm:p-2 w-full">
          <HomeSlider data={slide} />
        </div>
      </div>

      {NATIVE_ADS_ID && (
        <div className="w-full sm:container xl:max-w-7xl" suppressHydrationWarning>
          <NativeAds id={NATIVE_ADS_ID} />
        </div>
      )}

      <div className="container p-2 pt-0 sm:px-8 xl:max-w-7xl">
        <div className="grid grid-cols-3 gap-6 w-full p-2">
          <div className="flex flex-col gap-6 col-span-3 md:col-span-2">
            {Array.isArray(highlights) &&
              highlights.map(({ id, contents, title }) => (
                <HighlightContents
                  key={id}
                  title={title}
                  data={contents as any}
                  moreLink={`/the-loai/${slug(title)}-${id}`}
                />
              ))}
          </div>
          <div className="col-span-3 md:col-span-1">
            <CategoryList data={categories} />
          </div>
        </div>
      </div>
    </main>
  );
}
