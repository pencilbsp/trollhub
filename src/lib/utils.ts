import slug from "slug";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { ContentType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avatarNameFallback(name: string) {
  const words = name.split(" ");
  let nameFallback = words[0][0].toLocaleUpperCase();

  if (words.length > 1) {
    nameFallback += words[1][0].toLocaleUpperCase();
  }

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
