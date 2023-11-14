import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SupportRatio = "16/9" | "1/1" | "auto";

interface Props {
  alt: string;
  thumbUrl: string;
  className?: string;
  children?: React.ReactNode;
  ratio?: SupportRatio | string;
}

function getAspectRatio(ratio?: SupportRatio | string) {
  if (!ratio) return "";
  switch (ratio) {
    case "1/1":
      return "aspect-square";
    case "auto":
      return "aspect-auto";
    case "16/9":
      return "aspect-video";
    default:
      return `aspect-[${ratio}]`;
  }
}

export default function Thumbnail({ thumbUrl, alt, className, ratio, children }: Props) {
  let thumbHdUrl = thumbUrl;
  if (thumbUrl.endsWith("_256x")) thumbHdUrl = thumbHdUrl.replace("_256x", "_720x");

  return (
    <div className={cn(["w-full relative mt-6", getAspectRatio(ratio), className])}>
      <div
        className="absolute inset-0 blur-lg"
        style={{
          background: `url(${thumbUrl}) center center / cover scroll no-repeat`,
        }}
      />
      <Image
        alt={alt}
        width={0}
        height={0}
        sizes="100vh"
        src={thumbHdUrl}
        className="w-full h-full object-contain relative"
      />
      {children && <div className="flex flex-col items-end absolute top-0 right-5">{children}</div>}
    </div>
  );
}
