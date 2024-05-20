"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import dynamic from "next/dynamic";
import { ErrorData, ErrorDetails, ErrorTypes } from "hls.js";
// import { addListener, launch } from "devtools-detector"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  PlayerSrc,
  MediaPlayer,
  MediaProvider,
  MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import { Button } from "./ui/Button";
import cmd5xBuilder from "@/lib/cmd5x";

const JWPlayer = dynamic(() => import("./JWPlayer"), {
  loading: () => <PlayerLoading />,
});

const dashApi = "/api/prv-dash?";

// if (process.env.NODE_ENV === "production") {
//   addListener((isOpen) => {
//     if (isOpen) {
//       window.location.replace("/")
//     }
//   })
//   launch()
// }

export type CustomSrc = PlayerSrc & {
  src?: string;
  streameUrl?: string;
  streameId: string | null;
};

type Props = {
  src: CustomSrc;
  thumbnails?: string;
  provider?: "jwplayer" | "vidstack";
};

/* -------------------------------------------------------------------------------------------------
 * Video Player
 * -----------------------------------------------------------------------------------------------*/

export default function VideoPlayer({
  src,
  thumbnails,
  provider = "vidstack",
}: Props) {
  const player = useRef<MediaPlayerInstance>(null);
  const [error, setError] = useState<ErrorData | null>(null);
  const [source, setSource] = useState<CustomSrc | null>(
    src.streameId ? null : src
  );

  const isLoading = !source && !error;

  const onHlsError = (error: ErrorData) => {
    player.current?.destroy();
    setError(error);
  };

  const onClick = () => {
    setError(null);
    setSource(null);
    loadSources();
  };

  const loadSources = useCallback(async () => {
    if (src.streameId) {
      try {
        const ts = Date.now().toString();
        const query = new URLSearchParams({ file_id: src.streameId!, ts });

        const xkey = window.cmd5x(dashApi + query.toString());
        query.append("xkey", xkey);

        const response = await fetch(dashApi + query.toString());
        if (!response.ok) throw new Error("Unable to get video information");

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        // @ts-ignore
        setSources({ ...src, src: data.data.m3u8 });
      } catch (error: any) {
        setError({
          error,
          details: ErrorDetails.LEVEL_LOAD_ERROR,
          type: ErrorTypes.MEDIA_ERROR,
          fatal: false,
        });
      }
    } else {
      setSource(src);
    }
  }, [src]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (typeof window.cmd5x === "undefined") {
        cmd5xBuilder({}, window);
      }
    }

    loadSources();
  }, [src, loadSources]);

  if (isLoading) return <PlayerLoading />;

  if (!isLoading && error)
    return (
      <VideoPlayerError
        onClick={onClick}
        buttonText="Thử lại"
        message={error.details}
      />
    );

  if (provider === "vidstack")
    return (
      <MediaPlayer
        playsinline
        ref={player}
        keyTarget="player"
        aspectRatio="16/9"
        src={source as any}
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
        <DefaultVideoLayout
          thumbnails={thumbnails}
          icons={defaultLayoutIcons}
          noScrubGesture
        />
      </MediaPlayer>
    );

  return <JWPlayer src={source?.src} />;
}

/* -------------------------------------------------------------------------------------------------
 * Video Player Components
 * -----------------------------------------------------------------------------------------------*/

function PlayerBox({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center justify-center aspect-video border border-dashed p-4">
      {children}
    </div>
  );
}

function PlayerLoading() {
  return <PlayerBox>Đang tải...</PlayerBox>;
}

type VideoPlayerErrorProps = {
  message: string;
  buttonText?: string;
  children?: ReactNode;
  buttonIcon?: ReactNode;
  onClick?: VoidFunction;
};

export function VideoPlayerError({
  message,
  buttonText,
  buttonIcon,
  onClick,
  children,
}: VideoPlayerErrorProps) {
  return (
    <PlayerBox>
      <p className="mb-3 text-base md:text-lg text-center">{message}</p>
      {children ? (
        children
      ) : buttonText ? (
        <Button className="items-center" onClick={onClick}>
          {buttonText}
          {buttonIcon}
        </Button>
      ) : null}
    </PlayerBox>
  );
}
