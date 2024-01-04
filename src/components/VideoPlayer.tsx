"use client"

import "@vidstack/react/player/styles/default/theme.css"
import "@vidstack/react/player/styles/default/layouts/video.css"

import { ErrorData } from "hls.js"
import { ReactNode, useRef, useState } from "react"
import { MediaPlayer, MediaPlayerInstance, MediaProvider, PlayerSrc } from "@vidstack/react"
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default"

import { Button } from "./ui/Button"

type Props = {
  src: PlayerSrc
  thumbnails?: string
}

export default function VideoPlayer({ src, thumbnails }: Props) {
  const player = useRef<MediaPlayerInstance>(null)
  const [error, setError] = useState<ErrorData | null>(null)

  const onHlsError = (error: ErrorData) => {
    player.current?.destroy()
    setError(error)
  }

  const onClick = () => setError(null)

  if (error) return <VideoPlayerError message={error.details} buttonText="Thử lại" onClick={onClick} />

  return (
    <MediaPlayer
      src={src}
      playsinline
      ref={player}
      keyTarget="player"
      aspectRatio="16/9"
      onHlsError={onHlsError}
      keyShortcuts={{
        toggleMuted: "m",
        volumeUp: "ArrowUp",
        toggleCaptions: "c",
        toggleFullscreen: "f",
        volumeDown: "ArrowDown",
        togglePaused: "k Space",
        seekBackward: "ArrowLeft",
        seekForward: "ArrowRight",
        togglePictureInPicture: "i",
      }}
    >
      <MediaProvider />
      <DefaultVideoLayout thumbnails={thumbnails} icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}

type VideoPlayerErrorProps = {
  message: string
  buttonText?: string
  buttonIcon?: ReactNode
  onClick?: VoidFunction
  children?: ReactNode
}

export function VideoPlayerError({ message, buttonText, buttonIcon, onClick, children }: VideoPlayerErrorProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center aspect-video border border-dashed p-4">
      <p className="mb-3 text-base md:text-lg text-center">{message}</p>
      {children ? (
        children
      ) : buttonText ? (
        <Button className="items-center" onClick={onClick}>
          {buttonText}
          {buttonIcon}
        </Button>
      ) : null}
    </div>
  )
}
