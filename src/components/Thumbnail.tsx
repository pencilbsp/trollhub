import Image from "next/image"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import { EyeOffIcon } from "lucide-react"
import useSettings from "@/hooks/useSettings"

type SupportRatio = "16/9" | "1/1" | "auto"

interface Props {
  alt: string
  thumbUrl: string
  className?: string
  adultContent?: boolean
  children?: React.ReactNode
  ratio?: SupportRatio | string
}

function getAspectRatio(ratio?: SupportRatio | string) {
  if (!ratio) return ""
  switch (ratio) {
    case "1/1":
      return "aspect-square"
    case "auto":
      return "aspect-auto"
    case "16/9":
      return "aspect-video"
    default:
      return `aspect-[${ratio}]`
  }
}

export default function Thumbnail({ thumbUrl, alt, className, ratio, adultContent, children }: Props) {
  const { showAdultContent } = useSettings()
  const isShow = adultContent && !showAdultContent

  let thumbHdUrl = thumbUrl
  if (thumbUrl.endsWith("_256x")) thumbHdUrl = thumbHdUrl.replace("_256x", "_720x")

  return (
    <div className={cn(["w-full relative mt-6 z-10", getAspectRatio(ratio), className])}>
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
        loading="lazy"
        src={thumbHdUrl}
        className={cn("w-full h-full object-contain relative", isShow && "blur-md")}
      />
      {isShow && (
        <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-muted font-light">
          <EyeOffIcon className="cursor-pointer w-4 h-4" />
          <span className="text-xs text-center mt-2">
            Hình ảnh chứa
            <br />
            nội dung nhạy cảm
          </span>
        </div>
      )}
      {children && <div className="flex flex-col items-end absolute top-0 right-5">{children}</div>}
    </div>
  )
}
