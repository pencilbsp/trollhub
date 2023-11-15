import slug from "slug";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

import { ContentType } from "@prisma/client";
import { Content } from "@/actions/getContent";

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

export function generateKeywords(title: string, data: string[], userName: string, type: ContentType) {
  const titleEng = slug(title, { replacement: "" });
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
      : ["đọc truyện", "truyện hay", "đọc truyện online", "đọc truyenfull", "truyện tranh", "truyện ngôn tình"])
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
    keywords: generateKeywords(data.title, data.akaTitle, data.creator.name, data.type),
    openGraph: {
      type: data.type === "movie" ? "video.movie" : "website",
      title: data.title,
      siteName: "fuhuzz.rip",
      locale: "vi_VN",
      description: data.description?.slice(0, 255),
      images: {
        url: data.thumbUrl!,
      },
    },
  };
}
