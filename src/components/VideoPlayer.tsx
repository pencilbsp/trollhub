"use client"

import "@vidstack/react/player/styles/default/theme.css"
import "@vidstack/react/player/styles/default/layouts/video.css"

import { MediaPlayer, MediaProvider, PlayerSrc } from "@vidstack/react"
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default"

type Props = {
  src: PlayerSrc
  thumbnails?: string
}

export default function VideoPlayer({ src, thumbnails }: Props) {
  return (
    <MediaPlayer
      src={src}
      keyTarget="player"
      onError={(e) => console.log("HLS lỗi", e.message)}
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
      style={{
        "--video-border": "none",
        "--video-border-radius": 0,
      }}
    >
      <MediaProvider />
      <DefaultVideoLayout thumbnails={thumbnails} icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}
