import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
