import slug from "slug";

import vi from "date-fns/locale/vi";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { Metadata, MetadataRoute } from "next";
import { format, formatDistanceToNow } from "date-fns";

import prisma from "./prisma";
import { SITE_URL } from "@/config";
import { ContentType } from "@prisma/client";
import { Content } from "@/actions/contentActions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avatarNameFallback(name?: string | null) {
  if (!name) return "NA";

  const words = name.split(" ");
  let nameFallback = words[0][0].toLocaleUpperCase();
  if (words.length > 1) nameFallback += words[1][0].toLocaleUpperCase();

  return nameFallback;
}

export function generateKeywords(
  title: string,
  data: string[],
  userName: string,
  type: ContentType
) {
  const titleEng = slug(title, { replacement: " " });
  const prefixVie = type === "movie" ? "phim " : "truyện ";
  const prefixEng = type === "movie" ? "phim " : "truyen ";

  const keywords = [];
  keywords.push(title);
  type === "movie" && keywords.push(title + " vietsub");
  keywords.push(title + " fuhu");
  keywords.push(titleEng);
  keywords.push(titleEng + " fuhu");
  keywords.push(prefixVie + title);
  keywords.push(prefixEng + titleEng);
  keywords.push(title + " " + userName);
  keywords.push(userName);
  keywords.push(...data);
  keywords.push(
    ...(type === "movie"
      ? ["xem phim", "xem phim online", "phim vietsub"]
      : [
          "đọc truyện",
          "truyện hay",
          "đọc truyện online",
          "đọc truyenfull",
          "truyện tranh",
          "truyện ngôn tình",
        ])
  );

  return keywords;
}

export function getSlugId(slug: string) {
  if (slug.endsWith(".html")) {
    return slug.replace(".html", "").split("_")?.[1];
  } else {
    return slug.slice(-24);
  }
}

export function generateContentMetadata(data: Content): Metadata {
  return {
    title: data.title + " - " + data.creator.name,
    description: data.description?.slice(0, 255),
    keywords: generateKeywords(
      data.title,
      data.akaTitle,
      data.creator.name,
      data.type
    ),
    openGraph: {
      locale: "vi_VN",
      title: data.title,
      siteName: SITE_URL.origin,
      images: { url: data.thumbUrl! },
      description: data.description?.slice(0, 255),
      type: data.type === "movie" ? "video.movie" : "website",
    },
  };
}

export const formatToNow = (data: string | number | Date) => {
  return formatDistanceToNow(new Date(data), {
    locale: vi,
    includeSeconds: true,
    addSuffix: true,
  });
};

export const formatDate = (
  data: string | number | Date,
  fstring: string = "HH:mm dd/MM/yyyy"
) => {
  return format(new Date(data), fstring, { locale: vi });
};

export async function generateSitemap({
  id,
  type,
  take,
}: {
  id: number;
  take: number;
  type: ContentType;
}): Promise<MetadataRoute.Sitemap> {
  const skip = id * take;

  const contents = await prisma.content.findMany({
    where: {
      type,
    },
    skip: skip,
    take: skip + take,
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      type: true,
      title: true,
      updatedAt: true,
    },
  });

  return contents.map((content) => ({
    url: `${SITE_URL.origin}/${content.type}/${slug(content.title)}-${
      content.id
    }`,
    lastModified: content.updatedAt,
  }));
}

export function chaptersMapTable(data: any) {
  return data.map((i: any) => {
    const contentSlug = slug(i.content.title);

    return {
      id: i.id,
      title: i.title!,
      createdAt: i.createdAt,
      contentId: i.content.id,
      status: i.status.toString(),
      contentTitle: i.content.title!,
      mobileOnly: i.mobileOnly.toString(),
      contentUrl: `/${i.type}/${contentSlug}-${i.content.id}`,
      url: `/${
        i.type !== "movie" ? "chapter" : "episode"
      }/${contentSlug}-${slug(i.title)}-${i.id}`,
      app: `https://fuhu.page.link/?link=https://fuhux.com/${
        i.type === "movie"
          ? "movie-eps"
          : i.type === "comic"
          ? "comic-chapter"
          : "novel-chapter"
      }/${contentSlug}_${
        i.fid
      }.html&apn=net.zfunhub&ibi=net.mbf.FunHub&isi=1572604579`,
    };
  });
}
